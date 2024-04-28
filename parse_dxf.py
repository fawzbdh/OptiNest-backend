import sys
import json
import ezdxf
import matplotlib.pyplot as plt
from matplotlib.patches import Arc
import numpy as np

def calculate_dimensions(file_path):
    doc = ezdxf.readfile(file_path)
    msp = doc.modelspace()

    min_x = float('inf')
    min_y = float('inf')
    max_x = float('-inf')
    max_y = float('-inf')

    for entity in msp:
        if entity.dxftype() == 'LINE':
            start_point = entity.dxf.start
            end_point = entity.dxf.end
            min_x = min(min_x, start_point[0], end_point[0])
            max_x = max(max_x, start_point[0], end_point[0])
            min_y = min(min_y, start_point[1], end_point[1])
            max_y = max(max_y, start_point[1], end_point[1])
        elif entity.dxftype() == 'ARC':
            center = entity.dxf.center
            radius = entity.dxf.radius
            start_angle = entity.dxf.start_angle
            end_angle = entity.dxf.end_angle
            arc_min_x = center[0] - radius
            arc_max_x = center[0] + radius
            arc_min_y = center[1] - radius
            arc_max_y = center[1] + radius
            min_x = min(min_x, arc_min_x)
            max_x = max(max_x, arc_max_x)
            min_y = min(min_y, arc_min_y)
            max_y = max(max_y, arc_max_y)
        elif entity.dxftype() == 'CIRCLE':
            center = entity.dxf.center
            radius = entity.dxf.radius
            circle_min_x = center[0] - radius
            circle_max_x = center[0] + radius
            circle_min_y = center[1] - radius
            circle_max_y = center[1] + radius
            min_x = min(min_x, circle_min_x)
            max_x = max(max_x, circle_max_x)
            min_y = min(min_y, circle_min_y)
            max_y = max(max_y, circle_max_y)

    width = max_x - min_x
    height = max_y - min_y
    return width, height

def save_image(file_path, image_path):
    doc = ezdxf.readfile(file_path)
    msp = doc.modelspace()

    fig, ax = plt.subplots()

    for entity in msp:
        if entity.dxftype() == 'LINE':
            start_point = (entity.dxf.start[0], entity.dxf.start[1])
            end_point = (entity.dxf.end[0], entity.dxf.end[1])
            ax.plot([start_point[0], end_point[0]], [start_point[1], end_point[1]], color='black')
        elif entity.dxftype() == 'ARC':
            center = (entity.dxf.center[0], entity.dxf.center[1])
            radius = entity.dxf.radius
            start_angle = np.deg2rad(entity.dxf.start_angle)
            end_angle = np.deg2rad(entity.dxf.end_angle)
            arc = Arc(center, radius*2, radius*2, linewidth=1, theta1=np.rad2deg(start_angle), theta2=np.rad2deg(end_angle))
            ax.add_patch(arc)
        elif entity.dxftype() == 'CIRCLE':
            center = (entity.dxf.center[0], entity.dxf.center[1])
            radius = entity.dxf.radius
            circle = plt.Circle(center, radius, color='black', fill=False)
            ax.add_artist(circle)

    ax.set_aspect('equal', 'box')
    ax.set_axis_off()  # Turn off axis
    ax.set_xticks([])  # Hide x-axis ticks
    ax.set_yticks([])  # Hide y-axis ticks
    fig.subplots_adjust(left=0, right=1, bottom=0, top=1)  # Adjust margins to remove any external space

    fig.patch.set_alpha(0)  # Set transparent background
    fig.savefig(image_path, bbox_inches='tight', pad_inches=0, transparent=True)  # Save figure with transparent background and without padding




if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python parse_dxf.py <dxf_file_path> <image_path>")
        sys.exit(1)

    dxf_file_path = sys.argv[1]
    image_path = sys.argv[2]

    width, height = calculate_dimensions(dxf_file_path)
    dimensions = {'width': width, 'height': height}
    print(json.dumps(dimensions))

    save_image(dxf_file_path, image_path)
