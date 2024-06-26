import json
import os
import sys
from show import PltFunc
from geofunc import GeoFunc
import packing as packing
import datetime
from data import getData
from shapely.geometry import Polygon, Point, mapping, LineString
from shapely.ops import unary_union
import matplotlib.pyplot as plt

class BottomLeftFill(object):
    def __init__(self, width, length, original_polygons, offset=(0, 0), marge=(0, 0), **kw):
        self.choose_nfp = False
        self.width = width
        self.length = length  # Use the passed length parameter
        self.contain_length = length  # Initialize the container length to the passed length
        self.offset = offset
        self.marge = marge
        self.polygons = original_polygons
        self.NFPAssistant = kw.get("NFPAssistant", None)
        self.vertical = kw.get("vertical", False)
        self.translations = []

        print("Total Num:", len(original_polygons))
        self.placeFirstPoly()
        for i in range(1, len(self.polygons)):
            print(f"############################## Place the {i + 1}th shape #################################")
            self.placePoly(i)

        self.getLength()

    def placeFirstPoly(self):
        poly = self.polygons[0]
        left_index, bottom_index, right_index, top_index = GeoFunc.checkBound(poly)
        translation = (-poly[left_index][0] + self.marge[0], -poly[bottom_index][1] + self.marge[1])
        GeoFunc.slidePoly(poly, *translation)
        self.translations.append(translation)

    def placePoly(self, index):
        adjoin = self.polygons[index]
        if self.vertical:
            ifr = packing.PackingUtil.getInnerFitRectangle(self.polygons[index], self.width, self.length)
        else:
            ifr = packing.PackingUtil.getInnerFitRectangle(self.polygons[index], self.length, self.width)
        differ_region = Polygon(ifr)

        for main_index in range(0, index):
            main = self.polygons[main_index]
            if self.NFPAssistant is None:
                nfp = NFP(main, adjoin, offset=self.offset).nfp
            else:
                nfp = self.NFPAssistant.getDirectNFP(main, adjoin, offset=self.offset)
            nfp_poly = Polygon(nfp)
            try:
                differ_region = differ_region.difference(nfp_poly)
            except:
                print('NFP failure, areas of polygons are:')
                self.showAll()
                for poly in [main, adjoin]:
                    print(Polygon(poly).area)
                self.showPolys([main, adjoin, nfp])
                print('NFP loaded from:', self.NFPAssistant.history_path)

        differ = GeoFunc.polyToArr(differ_region)
        differ_index = self.getBottomLeft(differ)
        refer_pt_index = GeoFunc.checkTop(adjoin)
        placement_point = [differ[differ_index][0] + self.offset[0], differ[differ_index][1] + self.offset[1]]
        translation = (placement_point[0] - adjoin[refer_pt_index][0], placement_point[1] - adjoin[refer_pt_index][1])
        GeoFunc.slideToPoint(self.polygons[index], adjoin[refer_pt_index], placement_point)

        # Add margin if placed near the container border
        if self.isNearBorder(placement_point):
            translation = (translation[0] + self.marge[0], translation[1] + self.marge[1])
            GeoFunc.slidePoly(self.polygons[index], self.marge[0], self.marge[1])

        self.translations.append(translation)

    def isNearBorder(self, placement_point):
        near_left = placement_point[0] <= self.marge[0]
        near_bottom = placement_point[1] <= self.marge[1]
        near_right = placement_point[0] >= (self.width - self.marge[0])
        near_top = placement_point[1] >= (self.contain_length - self.marge[1])
        return near_left or near_bottom or near_right or near_top

    def getBottomLeft(self, poly):
        bl = []
        _min = 999999
        for i, pt in enumerate(poly):
            pt_object = {"index": i, "x": pt[0], "y": pt[1]}
            target = pt[1] if self.vertical else pt[0]
            if target < _min:
                _min = target
                bl = [pt_object]
            elif target == _min:
                bl.append(pt_object)
        if len(bl) == 1:
            return bl[0]["index"]
        else:
            target = "x" if self.vertical else "y"
            _min = bl[0][target]
            one_pt = bl[0]
            for pt_index in range(1, len(bl)):
                if bl[pt_index][target] < _min:
                    one_pt = bl[pt_index]
                    _min = one_pt["y"]
            return one_pt["index"]

    def showAll(self):
        fig, ax = plt.subplots()
        container = Polygon([(0, 0), (0, self.length), (self.width, self.length), (self.width, 0)])
        x, y = container.exterior.xy
        ax.plot(x, y, color='black')

        for poly in self.polygons:
            polygon = Polygon(poly)
            x, y = polygon.exterior.xy
            ax.fill(x, y, alpha=1)

        ax.set_xlim(0, self.width)
        ax.set_ylim(0, self.length)
        ax.set_aspect('equal', adjustable='box')
        ax.axis('off')
        plt.show()

    def showPolys(self, polys):
        for i in range(len(polys) - 1):
            PltFunc.addPolygon(polys[i])
        PltFunc.addPolygonColor(polys[len(polys) - 1])
        length = max(self.width, self.contain_length)
        PltFunc.showPlt(width=max(length, self.width), height=max(length, self.width), minus=200)

    def getLength(self):
        _max = 0
        for i in range(len(self.polygons)):
            extreme_index = GeoFunc.checkTop(self.polygons[i]) if self.vertical else GeoFunc.checkRight(self.polygons[i])
            extreme = self.polygons[i][extreme_index][1] if self.vertical else self.polygons[i][extreme_index][0]
            if extreme > _max:
                _max = extreme
        self.contain_length = _max
        return _max
        
    def export_to_dxf(self, filename):
      import ezdxf
      doc = ezdxf.new(dxfversion='R2010')
      msp = doc.modelspace()

    # Dessiner le polygone de la corbeille
      # Dessiner le polygone de la corbeille
      bin_polygon = Polygon([(0, 0), (0, self.length), (self.width, self.length), (self.width, 0)])
      bin_polyline = doc.modelspace().add_lwpolyline(bin_polygon.exterior.coords, close=True)
  
    # Dessiner chaque polygone placé
      for poly in self.polygons:
        polygon = Polygon(poly)
        msp.add_lwpolyline(list(polygon.exterior.coords), close=True)

    # Enregistrer le polygone de la corbeille dans le fichier DXF
        doc.saveas(os.path.join(folder_path, filename))
        
    def export_to_png(self, filename):
        fig, ax = plt.subplots()
        container = Polygon([(0, 0), (0, self.length), (self.width, self.length), (self.width, 0)])
        x, y = container.exterior.xy
        ax.plot(x, y, color='black')

        for poly in self.polygons:
            polygon = Polygon(poly)
            x, y = polygon.exterior.xy
            ax.fill(x, y, alpha=1)

        ax.set_xlim(0, self.width)
        ax.set_ylim(0, self.length)
        ax.set_aspect('equal', adjustable='box')
        ax.axis('off')

        plt.savefig(os.path.join(folder_path, filename), bbox_inches='tight', pad_inches=0)

        plt.close()
    
def save_results(results):
     print(json.dumps(results))

if __name__ == '__main__':
    index = 0
    config_file = sys.argv[1]
    folder_path = sys.argv[2]
    transformedData = sys.argv[3]

    polys = getData(index, config_file)
    
    bin_configs = json.loads(transformedData)
    results = []

    base_url = "http://localhost:8000/uploads"

    for bin_config in bin_configs:
        nfp_ass = packing.NFPAssistant(polys, store_nfp=True, get_all_nfp=True, load_history=True)
        bfl = BottomLeftFill(bin_config["width"], bin_config["length"], polys,
                             vertical=bin_config["vertical"], NFPAssistant=nfp_ass,
                             offset=(bin_config["x"], bin_config["y"]), marge=(bin_config["x"], bin_config["y"]))

        filename_prefix = f"bin_{bin_config['width']}_{bin_config['length']}"
        output_dxf_filename = os.path.join(folder_path, f"{filename_prefix}.dxf")
        output_png_filename = os.path.join(folder_path, f"{filename_prefix}.png")
        
        bfl.export_to_dxf(output_dxf_filename)
        bfl.export_to_png(output_png_filename)
        
        project_id = folder_path.split("project_")[1]
        results.append({
            "formatId": bin_config["formatId"],
            "fichier_dxf": f"{base_url}/project_{project_id}/{filename_prefix}.dxf",
            "url_image": f"{base_url}/project_{project_id}/{filename_prefix}.png"
        })
    
    save_results(results)