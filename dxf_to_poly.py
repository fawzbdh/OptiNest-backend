import ezdxf
import json
import csv
import os
import math
import sys
import requests
import tempfile
from urllib.parse import unquote

def download_dxf(url):
    response = requests.get(url)
    if response.status_code == 200:
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_file.write(response.content)
            return temp_file.name
    else:
        print("Failed to download DXF file:", response.status_code)
        return None

def interpolate_arc(arc, num_points=10):
    points = []
    for i in range(num_points):
        angle = arc.dxf.start_angle + (arc.dxf.end_angle - arc.dxf.start_angle) * (i / (num_points - 1))
        x = arc.dxf.center.x + arc.dxf.radius * math.cos(math.radians(angle))
        y = arc.dxf.center.y + arc.dxf.radius * math.sin(math.radians(angle))
        points.append([x, y])
    return points

def interpolate_circle(circle, num_points=10):
    points = []
    for i in range(num_points):
        angle = 360 * (i / num_points)
        x = circle.dxf.center.x + circle.dxf.radius * math.cos(math.radians(angle))
        y = circle.dxf.center.y + circle.dxf.radius * math.sin(math.radians(angle))
        points.append([x, y])
    return points

def extract_points_from_dxf(dxf_file):
    doc = ezdxf.readfile(dxf_file)
    msp = doc.modelspace()
    polygons = []

    lines = []
    polylines = []
    arcs = []
    circles = []

    for entity in msp:
        if entity.dxftype() == 'LINE':
            lines.append([[entity.dxf.start.x, entity.dxf.start.y], [entity.dxf.end.x, entity.dxf.end.y]])
        elif entity.dxftype() == 'POLYLINE':
            polylines.append([[v.dxf.location.x, v.dxf.location.y] for v in entity.vertices])
        elif entity.dxftype() == 'ARC':
            arcs.append(interpolate_arc(entity))
        elif entity.dxftype() == 'CIRCLE':
            circles.append(interpolate_circle(entity))

    # Combine lines into polygons
    line_dict = {}
    for line in lines:
        start, end = tuple(line[0]), tuple(line[1])
        if start not in line_dict:
            line_dict[start] = []
        if end not in line_dict:
            line_dict[end] = []
        line_dict[start].append(end)
        line_dict[end].append(start)

    visited = set()
    def traverse(point, path):
        visited.add(point)
        path.append(list(point))
        for neighbor in line_dict[point]:
            if neighbor not in visited:
                traverse(neighbor, path)

    for start in line_dict:
        if start not in visited:
            path = []
            traverse(start, path)
            if path:
                polygons.append(path)

    polygons.extend(polylines)
    polygons.extend(arcs)
    polygons.extend(circles)

    return polygons

def process_files(config, output_dir,projet_id):
    files = sorted(config['files'], key=lambda x: x['priority'])
    output_data = []

    for file_info in files:
        filename = "http://localhost:8000/uploads/project_"+projet_id+"/"+ file_info['name']
        quantity = file_info['quantity']
        encoded_filename = unquote(filename)
        print("Processing file:", encoded_filename)

        local_filename = download_dxf(encoded_filename)
        if local_filename:
            polygons = extract_points_from_dxf(local_filename)

            for polygon in polygons:
                output_data.append({
                    'num': quantity,
                    'polygon': polygon
                })
            os.remove(local_filename)
        else:
            print("Skipping file:", filename)

    output_dir = os.path.abspath(output_dir)
    output_file = os.path.join(output_dir, 'output_points.csv')
    with open(output_file, 'w', newline='') as csvfile:
        fieldnames = ['num', 'polygon']
        csvwriter = csv.DictWriter(csvfile, fieldnames=fieldnames)
        csvwriter.writeheader()
        for data in output_data:
            csvwriter.writerow({
                'num': data['num'],
                'polygon': json.dumps(data['polygon'])
            })

if __name__ == '__main__':
    config_json = sys.argv[1]
    output_dir = sys.argv[2]
    projet_id = sys.argv[3]

    config = json.loads(config_json)  # Load the JSON string into a dictionary
    process_files(config, output_dir,projet_id)
