import sys
from show import PltFunc
from geofunc import GeoFunc
import packing as packing
import datetime
from data import getData
from shapely.geometry import Polygon, Point, mapping, LineString
from shapely.ops import unary_union
import pandas as pd
import json
import copy



class NFP(object):
    def __init__(self, poly1, poly2, offset=(0, 0), **kw):
        self.stationary = copy.deepcopy(poly1)
        self.sliding = copy.deepcopy(poly2)
        self.offset = offset
        start_point_index = GeoFunc.checkBottom(self.stationary)
        self.start_point = [poly1[start_point_index][0], poly1[start_point_index][1]]
        self.locus_index = GeoFunc.checkTop(self.sliding)
        self.original_top = list(self.sliding[self.locus_index])
        GeoFunc.slideToPoint(self.sliding, self.sliding[self.locus_index], self.start_point)
        self.start = True
        self.nfp = []
        #self.rectangle = False  # Force rectangle to be False
        self.error = 1
        self.main()
        if kw.get("show", False):
            self.showResult()
        GeoFunc.slideToPoint(self.sliding, self.sliding[self.locus_index], self.original_top)

    def main(self):
        i = 0
        if self.rectangle:
            width = self.sliding[1][0] - self.sliding[0][0]
            height = self.sliding[3][1] - self.sliding[0][1]
            self.nfp = [[self.stationary[0][0] - self.offset[0], self.stationary[0][1] - self.offset[1]],
                        [self.stationary[1][0] + width + self.offset[0], self.stationary[1][1] - self.offset[1]],
                        [self.stationary[2][0] + width + self.offset[0], self.stationary[2][1] + height + self.offset[1]],
                        [self.stationary[3][0] - self.offset[0], self.stationary[3][1] + height + self.offset[1]]]
        else:
            while not self.judgeEnd() and i < 500:
                touching_edges = self.detectTouching()
                all_vectors = self.potentialVector(touching_edges)
                if not all_vectors:
                    self.error = -2
                    break

                vector = self.feasibleVector(all_vectors, touching_edges)
                if not vector:
                    self.error = -5
                    break

                self.trimVector(vector)
                if vector == [0, 0]:
                    self.error = -3
                    break

                GeoFunc.slidePoly(self.sliding, vector[0], vector[1])
                self.nfp.append([self.sliding[self.locus_index][0],
                                 self.sliding[self.locus_index][1]])
                i += 1
                inter = Polygon(self.sliding).intersection(Polygon(self.stationary))
                if GeoFunc.computeInterArea(inter) > 1:
                    self.error = -4
                    break

        if i == 500:
            self.error = -1

    def detectTouching(self):
        touch_edges = []
        stationary_edges, sliding_edges = self.getAllEdges()
        for edge1 in stationary_edges:
            for edge2 in sliding_edges:
                inter = GeoFunc.intersection(edge1, edge2)
                if inter:
                    pt = [inter[0], inter[1]]
                    edge1_bound = GeoFunc.almostEqual(edge1[0], pt) or GeoFunc.almostEqual(edge1[1], pt)
                    edge2_bound = GeoFunc.almostEqual(edge2[0], pt) or GeoFunc.almostEqual(edge2[1], pt)
                    stationary_start = GeoFunc.almostEqual(edge1[0], pt)
                    orbiting_start = GeoFunc.almostEqual(edge2[0], pt)
                    touch_edges.append({
                        "edge1": edge1,
                        "edge2": edge2,
                        "vector1": self.edgeToVector(edge1),
                        "vector2": self.edgeToVector(edge2),
                        "edge1_bound": edge1_bound,
                        "edge2_bound": edge2_bound,
                        "stationary_start": stationary_start,
                        "orbiting_start": orbiting_start,
                        "pt": [inter[0], inter[1]],
                        "type": 0
                    })
        return touch_edges

    def potentialVector(self, touching_edges):
        all_vectors = []
        for touching in touching_edges:
            aim_edge = []
            if touching["edge1_bound"] and touching["edge2_bound"]:
                right, left, parallel = GeoFunc.judgePosition(touching["edge1"], touching["edge2"])
                if touching["stationary_start"] and touching["orbiting_start"]:
                    touching["type"] = 0
                    if left:
                        aim_edge = [touching["edge2"][1], touching["edge2"][0]]
                    if right:
                        aim_edge = touching["edge1"]
                elif touching["stationary_start"] and not touching["orbiting_start"]:
                    touching["type"] = 1
                    if left:
                        aim_edge = touching["edge1"]
                elif not touching["stationary_start"] and touching["orbiting_start"]:
                    touching["type"] = 2
                    if right:
                        aim_edge = [touching["edge2"][1], touching["edge2"][0]]
                elif not touching["stationary_start"] and not touching["orbiting_start"]:
                    touching["type"] = 3
            elif not touching["edge1_bound"] and touching["edge2_bound"]:
                aim_edge = [touching["pt"], touching["edge1"][1]]
                touching["type"] = 4
            elif touching["edge1_bound"] and not touching["edge2_bound"]:
                aim_edge = [touching["edge2"][1], touching["pt"]]
                touching["type"] = 5

            if aim_edge:
                vector = self.edgeToVector(aim_edge)
                if not self.detectExisting(all_vectors, vector):
                    all_vectors.append(vector)
        return all_vectors

    def detectExisting(self, vectors, judge_vector):
        for vector in vectors:
            if GeoFunc.almostEqual(vector, judge_vector):
                return True
        return False

    def edgeToVector(self, edge):
        return [edge[1][0] - edge[0][0], edge[1][1] - edge[0][1]]

    def feasibleVector(self, all_vectors, touching_edges):
        res_vector = []
        for vector in all_vectors:
            feasible = True
            for touching in touching_edges:
                vector1 = touching["vector1"] if touching["stationary_start"] else [-touching["vector1"][0], -touching["vector1"][1]]
                vector2 = touching["vector2"] if touching["orbiting_start"] else [-touching["vector2"][0], -touching["vector2"][1]]
                vector12_product = GeoFunc.crossProduct(vector1, vector2)
                vector_vector1_product = GeoFunc.crossProduct(vector1, vector)
                vector_vector2_product = GeoFunc.crossProduct(vector2, vector)
                if touching["type"] == 4 and (vector_vector1_product * vector12_product) < 0:
                    feasible = False
                if touching["type"] == 5 and (vector_vector2_product * (-vector12_product)) > 0:
                    feasible = False
                if vector12_product > 0 and vector_vector1_product < 0 and vector_vector2_product < 0:
                    feasible = False
                if vector12_product < 0 and vector_vector1_product > 0 and vector_vector2_product > 0:
                    feasible = False
                if vector12_product == 0:
                    inter = GeoFunc.newLineInter(touching["edge1"], touching["edge2"])
                    if inter["geom_type"] == "LineString" and inter["length"] > 0.01:
                        if (touching["orbiting_start"] and vector_vector2_product < 0) or (not touching["orbiting_start"] and vector_vector2_product > 0):
                            feasible = False
                    elif touching["orbiting_start"] != touching["stationary_start"] and vector_vector1_product == 0:
                        if touching["vector1"][0] * vector[0] > 0:
                            feasible = False
            if feasible:
                res_vector = vector
                break
        return res_vector

    def trimVector(self, vector):
        stationary_edges, sliding_edges = self.getAllEdges()
        new_vectors = []
        for pt in self.sliding:
            for edge in stationary_edges:
                line_vector = LineString([pt, [pt[0] + vector[0], pt[1] + vector[1]]])
                end_pt = [pt[0] + vector[0], pt[1] + vector[1]]
                line_polygon = LineString(edge)
                inter = line_vector.intersection(line_polygon)
                if inter.geom_type == "Point":
                    inter_mapping = mapping(inter)
                    inter_coor = inter_mapping["coordinates"]
                    if (abs(end_pt[0] - inter_coor[0]) > 0.01 or abs(end_pt[1] - inter_coor[1]) > 0.01) and (
                            abs(pt[0] - inter_coor[0]) > 0.01 or abs(pt[1] - inter_coor[1]) > 0.01):
                        new_vectors.append([inter_coor[0] - pt[0], inter_coor[1] - pt[1]])

        for pt in self.stationary:
            for edge in sliding_edges:
                line_vector = LineString([pt, [pt[0] - vector[0], pt[1] - vector[1]]])
                end_pt = [pt[0] - vector[0], pt[1] - vector[1]]
                line_polygon = LineString(edge)
                inter = line_vector.intersection(line_polygon)
                if inter.geom_type == "Point":
                    inter_mapping = mapping(inter)
                    inter_coor = inter_mapping["coordinates"]
                    if (abs(end_pt[0] - inter_coor[0]) > 0.01 or abs(end_pt[1] - inter_coor[1]) > 0.01) and (
                            abs(pt[0] - inter_coor[0]) > 0.01 or abs(pt[1] - inter_coor[1]) > 0.01):
                        new_vectors.append([pt[0] - inter_coor[0], pt[1] - inter_coor[1]])

        for vec in new_vectors:
            if abs(vec[0]) < abs(vector[0]) or abs(vec[1]) < abs(vector[1]):
                vector[0] = vec[0]
                vector[1] = vec[1]

    def getAllEdges(self):
        return GeoFunc.getPolyEdges(self.stationary), GeoFunc.getPolyEdges(self.sliding)

    def judgeEnd(self):
        sliding_locus = self.sliding[self.locus_index]
        main_bt = self.start_point
        if abs(sliding_locus[0] - main_bt[0]) < 0.1 and abs(sliding_locus[1] - main_bt[1]) < 0.1:
            if self.start:
                self.start = False
                return False
            else:
                return True
        else:
            return False

    def showResult(self):
        PltFunc.addPolygon(self.sliding)
        PltFunc.addPolygon(self.stationary)
        PltFunc.addPolygonColor(self.nfp)
        PltFunc.showPlt()

    def getDepth(self):
        d1 = Polygon(self.nfp).distance(Point(self.original_top))
        if d1 == 0:
            d2 = Polygon(self.nfp).boundary.distance(Point(self.original_top))
            return d2
        else:
            return 0


class BottomLeftFill(object):
    def __init__(self, width,length, original_polygons, offset=(0, 0),marge=(0,0), **kw):
        self.choose_nfp = False
        self.width = width
        self.length = length
        self.contain_length = length
        self.offset = offset
        self.marge=marge
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
        translation = (-poly[left_index][0]+self.marge[0], -poly[bottom_index][1]+self.marge[1])
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
        self.translations.append(translation)

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
        for i in range(len(self.polygons)):
            PltFunc.addPolygon(self.polygons[i])
        length =  self.contain_length
        PltFunc.showPlt(width=max(length,self.width),height= max(length ,self.length), minus=100)

    def showPolys(self, polys):
        for i in range(len(polys) - 1):
            PltFunc.addPolygon(polys[i])
        PltFunc.addPolygonColor(polys[len(polys) - 1])
        length = max(self.width, self.contain_length)
        PltFunc.showPlt(width=max(length, self.width), height=max(length, self.width), minus=000)

    def getLength(self):
        _max = 0
        for i in range(len(self.polygons)):
            extreme_index = GeoFunc.checkTop(self.polygons[i]) if self.vertical else GeoFunc.checkRight(self.polygons[i])
            extreme = self.polygons[i][extreme_index][1] if self.vertical else self.polygons[i][extreme_index][0]
            if extreme > _max:
                _max = extreme
        self.contain_length = _max
        return _max


if __name__ == '__main__':
    index = 0
    config_file_path =  sys.argv[1]
    
    polys = getData(index,config_file_path)
    nfp_ass = packing.NFPAssistant(polys, store_nfp=False, get_all_nfp=True, load_history=False)
    starttime = datetime.datetime.now()
    bfl = BottomLeftFill(500,700, polys, vertical=False, NFPAssistant=nfp_ass, offset=(0,0),marge=(0,0))  # Adjust the offset as needed
    endtime = datetime.datetime.now()
    print("total time:", endtime - starttime)
    bfl.showAll()