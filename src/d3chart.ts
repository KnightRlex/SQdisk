import * as d3 from "d3";
import prettyBytes from "pretty-bytes";
import { v4 as uuidv4 } from "uuid";

// pSBC function - copied from shade-blend-color package to avoid ESM/CommonJS compatibility issues
const pSBC = function(p: number, from: string, to?: string): string | null {
  if (
    typeof p !== "number" ||
    p < -1 ||
    p > 1 ||
    typeof from !== "string" ||
    (from[0] != "r" && from[0] != "#") ||
    (to && typeof to !== "string")
  )
    return null;
  var sbcRip = function(d: string) {
    var l = d.length;
    var RGB: any = {};
    if (l > 9) {
      d = d.split(",") as any;
      if (d.length < 3 || d.length > 4) return null;
      (RGB[0] = parseInt(d[0].split("(")[1])),
        (RGB[1] = parseInt(d[1])),
        (RGB[2] = parseInt(d[2])),
        (RGB[3] = d[3] ? parseFloat(d[3]) : -1);
    } else {
      if (l == 8 || l == 6 || l < 4) return null;
      if (l < 6)
        d =
          "#" +
          d[1] +
          d[1] +
          d[2] +
          d[2] +
          d[3] +
          d[3] +
          (l > 4 ? "" + d[4] + d[4] : "");
      var dNum = parseInt(d.slice(1), 16);
      (RGB[0] = (dNum >> 16) & 255),
        (RGB[1] = (dNum >> 8) & 255),
        (RGB[2] = dNum & 255),
        (RGB[3] = -1);
      if (l == 9 || l == 5)
        (RGB[3] = Math.round((RGB[2] / 255) * 10000) / 10000),
          (RGB[2] = RGB[1]),
          (RGB[1] = RGB[0]),
          (RGB[0] = (dNum >> 24) & 255);
    }
    return RGB;
  };
  var h = from.length > 9;
  var h2 =
    typeof to === "string"
      ? to.length > 9
        ? true
        : to == "c"
          ? !h
          : false
      : h;
  var b = p < 0;
  var p2 = b ? p * -1 : p;
  var to2 = to && to != "c" ? to : b ? "#000000" : "#FFFFFF";
  var f = sbcRip(from);
  var t = sbcRip(to2);
  if (!f || !t) return null;
  if (h2)
    return (
      "rgb" +
      (f[3] > -1 || t[3] > -1 ? "a(" : "(") +
      Math.round((t[0] - f[0]) * p2 + f[0]) +
      "," +
      Math.round((t[1] - f[1]) * p2 + f[1]) +
      "," +
      Math.round((t[2] - f[2]) * p2 + f[2]) +
      (f[3] < 0 && t[3] < 0
        ? ")"
        : "," +
        (f[3] > -1 && t[3] > -1
          ? Math.round(((t[3] - f[3]) * p2 + f[3]) * 10000) / 10000
          : t[3] < 0
            ? f[3]
            : t[3]) +
        ")")
    );
  return (
    "#" +
    (
      0x100000000 +
      Math.round((t[0] - f[0]) * p2 + f[0]) * 0x1000000 +
      Math.round((t[1] - f[1]) * p2 + f[1]) * 0x10000 +
      Math.round((t[2] - f[2]) * p2 + f[2]) * 0x100 +
      (f[3] > -1 && t[3] > -1
        ? Math.round(((t[3] - f[3]) * p2 + f[3]) * 255)
        : t[3] > -1
          ? Math.round(t[3] * 255)
          : f[3] > -1
            ? Math.round(f[3] * 255)
            : 255)
    )
      .toString(16)
      .slice(1, f[3] > -1 || t[3] > -1 ? undefined : -2)
  );
};

const depthmap: any = {
  0: 0,
  1: -0.05,
  2: -0.1,
  3: -0.15,
  4: -0.2,
  5: -0.25,
};

var width = 600;
var radius = width / 10;
var arc = d3
  .arc<D3HierarchyDiskItemArc>()
  .startAngle((d) => d.x0)
  .endAngle((d) => d.x1)
  .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
  .padRadius(radius * 1.5)
  .innerRadius((d) => d.y0 * radius)
  .outerRadius((d) => Math.max(d.y0 * radius, d.y1 * radius - 3));

const arcVisible = (d: D3HierarchyDiskItemArc) => {
  return d.y1 <= 4 && d.y0 >= 1 && d.x1 > d.x0;
};

const setTargetAngles = (
  filtered: Array<D3HierarchyDiskItem>,
  focusedNode: D3HierarchyDiskItem
) => {
  filtered.forEach((d) => {
    const focusedSegmentRadians = focusedNode.x1 - focusedNode.x0;
    const arcDeltaFrom = d.x0 - focusedNode.x0;
    const arcDeltaTo = d.x1 - focusedNode.x0;
    const fromPercentage = arcDeltaFrom / focusedSegmentRadians;
    const toPercentage = arcDeltaTo / focusedSegmentRadians;

    d.target = {
      x0: Math.max(0, Math.min(1, fromPercentage)) * 2 * Math.PI,
      x1: Math.max(0, Math.min(1, toPercentage)) * 2 * Math.PI,
      y0: Math.max(0, d.y0 - focusedNode.depth),
      y1: Math.max(0, d.y1 - focusedNode.depth),
    };
  });
};

const animateToTarget = (
  g: d3.Selection<SVGGElement, D3HierarchyDiskItem, null, undefined>,
  path: d3.Selection<
    SVGPathElement,
    D3HierarchyDiskItem,
    SVGGElement,
    D3HierarchyDiskItem
  >
) => {
  const t = g.transition().duration(750) as any;

  path
    .transition(t)
    .tween("data", (d) => {
      const i = d3.interpolate(d.current, d.target);
      return (t) => {
        const interpol = i(t);
        return (d.current = interpol);
      };
    })
    .filter(function (d: any) {
      return !!(+this.getAttribute("fill-opacity")! || arcVisible(d.target));
    })
    .attr("fill-opacity", (d: any) =>
      arcVisible(d.target) ? (d.children ? 0.85 : 0.75) : 0
    )
    .attr("filter", (d: any) =>
      arcVisible(d.target) ? "url(#neon-glow)" : "none"
    )
    .attrTween("d", (d) => () => arc(d.current)!)
    .end()
    .catch(() => {});
};

const simpleHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const getColor = (d: D3HierarchyDiskItem, focusedNode: D3HierarchyDiskItem) => {
  let v = -0.6;
  if (d.depth in depthmap) {
    v = depthmap[d.depth];
  }
  
  // Lista estricta. SIN interpolar.
  const neonPalette = [
    "#ff00ff", // Fucsia
    "#ff4500", // Naranja Neón
    "#ffffff", // Blanco Neon
    "#FF3131", // Rojo Neón    
    "#ffff00", // Amarillo Neón    
    "#00ffff", // Cian Neón
    "#39ff14"  // Verde Neón
  ];
  
  // Buscamos cuál es el "Hijo Directo" de la carpeta actual
  let directChild = d;
  while (directChild.parent && directChild.parent !== focusedNode) {
    directChild = directChild.parent;
  }
  
  // Obtenemos su nuevo ángulo (0 a 6.28...)
  const targetAngle = directChild.target ? directChild.target.x0 : directChild.x0;
  
  // Convertimos el ángulo en un número entero basado en la cantidad de colores que tienes (7)
  // Math.floor asegura que sea un número exacto (0, 1, 2, 3, 4, 5 o 6) sin decimales
  const index = Math.floor((targetAngle / (2 * Math.PI)) * neonPalette.length);
  
  // Elegimos el color estricto de la lista
  const baseColor = neonPalette[index % neonPalette.length];
  
  // Aplicamos la profundidad 3D
  return pSBC(v, baseColor);
};

const updateData = (
  root: D3HierarchyDiskItem,
  focused: D3HierarchyDiskItem,
  innerG: d3.Selection<SVGGElement, D3HierarchyDiskItem, null, undefined>,
  arcClickHandler: (event: any, focusedNode: D3HierarchyDiskItem) => void,
  hoverHandler: (event: any, focusedNode: D3HierarchyDiskItem) => void
) => {
  let filtered = [...focused.ancestors().slice(-1)];
  let initialDepth = focused.depth;
  let maxDepth = initialDepth + 3;
  let overallSize = focused.value || 0;
  let accumulator: D3HierarchyDiskItem | null = null;
  let accumulatorLastParent = null;
  let skipMap: any = {};

  for (const item of focused.descendants().slice(1)) {
    if (
      accumulator &&
      accumulatorLastParent &&
      item.parent !== accumulatorLastParent
    ) {
      filtered.push(accumulator);
      accumulator = null;
      accumulatorLastParent = null;
    }
    if (item.parent && item.parent!.data.id in skipMap) {
      skipMap[item.data.id] = true;
      continue;
    }
    if (item.depth > maxDepth) {
      break;
    }
    if ((item.value || 0) / overallSize > 0.005) {
      filtered.push(item);
    } else {
      if (accumulator) {
        skipMap[item.data.id] = true;
        accumulator.data.value! += item.value ?? 0;
        (accumulator as any).value += item.value ?? 0;
        (accumulator as any).current.x1 = item.current.x1;
        (accumulator as any).x1 = item.x1;
      } else {
        skipMap[item.data.id] = true;
        let v: DiskItem = {
          id: uuidv4(),
          isDirectory: false,
          name: "Smaller Items",
          value: item.value || 0,
          data: item.value || 0,
          children: [],
        };
        accumulator = d3.hierarchy(v) as D3HierarchyDiskItem;
        accumulatorLastParent = item.parent;
        accumulator.parent = item.parent;
        Object.assign((accumulator as any), item);
      }
    }
  }
  
  // Se eliminó la variable gcolor y el colorCounter porque ya no son necesarios al usar getColor()
  setTargetAngles(filtered, focused);

  const mul = window.OS_TYPE === "Windows_NT" ? 1024 : 1000;

  let path = innerG
    .selectAll<SVGPathElement, D3HierarchyDiskItem>("path")
    .data(filtered, (d) => d.data.id)
    .join(
        (enter) => {
        let xx = enter
          .append("path")
          .attr("fill", (d) => getColor(d, focused)) // <--- CAMBIO AQUÍ
          .attr("fill-opacity", (d) =>
            arcVisible(d.current) ? (d.children ? 0.85 : 0.75) : 0
          )
          .attr("filter", (d) =>
            arcVisible(d.current) ? "url(#neon-glow)" : "none"
          )
          .attr("d", (d) => arc(d.current))
          .style("cursor", "pointer")
          .on("click", arcClickHandler)
          .on("mouseover", (e, p) => hoverHandler(e, p));
          
        const tooltip = document.getElementById('d3-tooltip');
        if (tooltip) {
          xx.on("mouseover.tooltip", function(event, d) {
            tooltip.style.display = "block";
            const pathStr = d.ancestors().map((d) => d.data.name).reverse().join(" / ");
            const size = ((d.data.data || 0) / mul / mul / mul).toFixed(2);
            
            // <--- CAMBIO AQUÍ EN EL TOOLTIP
            const colorDeZona = getColor(d, focused); 
            
            tooltip.innerHTML = `<div style="font-weight:bold; margin-bottom:4px; color:${colorDeZona};">${pathStr}</div><div>${size} GB</div>`;
          })
          .on("mousemove.tooltip", function(event) {
            tooltip.style.left = (event.pageX + 20) + "px";
            tooltip.style.top = (event.pageY - 20) + "px";
          })
          .on("mouseout.tooltip", function() {
            tooltip.style.display = "none";
          });
        }
        return xx;
      },
        (update) => {
        // Actualizamos el tooltip para los elementos que ya existían
        const tooltip = document.getElementById('d3-tooltip');
        if (tooltip) {
          update.on("mouseover.tooltip", function(event, d) {
            tooltip.style.display = "block";
            const pathStr = d.ancestors().map((d) => d.data.name).reverse().join(" / ");
            const size = ((d.data.data || 0) / mul / mul / mul).toFixed(2);
            
            // Ahora sí toma el color del nuevo espacio al instante
            const colorDeZona = getColor(d, focused); 
            
            tooltip.innerHTML = `<div style="font-weight:bold; margin-bottom:4px; color:${colorDeZona};">${pathStr}</div><div>${size} GB</div>`;
          })
          .on("mousemove.tooltip", function(event) {
            tooltip.style.left = (event.pageX + 20) + "px";
            tooltip.style.top = (event.pageY - 20) + "px";
          })
          .on("mouseout.tooltip", function() {
            tooltip.style.display = "none";
          });
        }

        return update
          .attr("fill", (d) => getColor(d, focused)) 
          .attr("fill-opacity", (d) =>
            arcVisible(d.current) ? (d.children ? 0.85 : 0.75) : 0
          )
          .attr("filter", (d) =>
            arcVisible(d.current) ? "url(#neon-glow)" : "none"
          )
          .attr("d", (d) => arc(d.current));
      }
    );

  return path;
};

interface GetChartCallbacks {
  arcClicked: (e: any, node: D3HierarchyDiskItem) => D3HierarchyDiskItem;
  arcHover: (e: any, node: D3HierarchyDiskItem) => void;
  centerHover: (e: any, node: D3HierarchyDiskItem) => void;
}

export const getChart = (
  root: D3HierarchyDiskItem,
  svgElem: SVGSVGElement,
  { arcClicked, arcHover, centerHover }: GetChartCallbacks
) => {
  let current = root;

  let svg = d3
    .select<SVGSVGElement, D3HierarchyDiskItem>(svgElem)
    .attr("viewBox", [0, 0, width, width])
    .style("font", "10px sans-serif");

  // Filtro SVG para el efecto Neón
  const defs = svg.append("defs");
  const filter = defs.append("filter").attr("id", "neon-glow").attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
  filter.append("feGaussianBlur").attr("stdDeviation", "2.5").attr("result", "coloredBlur");
  const feMerge = filter.append("feMerge");
  feMerge.append("feMergeNode").attr("in", "coloredBlur");
  feMerge.append("feMergeNode").attr("in", "SourceGraphic");

  let g = svg
    .append("g")
    .attr("transform", `translate(${width / 2},${width / 2})`);

  let innerG = g.append("g");

  let backElement = g
    .append("circle")
    .datum(root)
    .attr("r", radius)
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .on("click", (e, p) => centerClickHandler(e, p))
    .on("mouseover", (e, p) => centerHoverHandler(e, p));

  let path = updateData(root, root, innerG, arcClickHandler, arcHoverHandler);

  // Botón Atrás en Fucsia para evitar el azul
  const backButtonGroup = svg.append("g")
    .attr("transform", `translate(30, 30)`)
    .style("cursor", "pointer")
    .on("click", () => {
      if (current === root) return;
      const parentNode = current.parent || root;
      centerClickHandler(null, parentNode);
    });

  backButtonGroup.append("circle")
    .attr("r", 16)
    .attr("fill", "rgba(10, 10, 20, 0.8)")
    .attr("stroke", "#ff00ff") // Fucsia
    .attr("stroke-width", 2)
    .style("filter", "drop-shadow(0 0 8px #ff00ff)");

  backButtonGroup.append("path")
    .attr("d", "M -6,-6 L -11,0 L -6,6 M -11,0 L 6,0")
    .attr("stroke", "#ff00ff")
    .attr("stroke-width", 2.5)
    .attr("fill", "none")
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round");

  backButtonGroup.on("mouseover", function () {
    d3.select(this).select("circle")
      .attr("stroke", "#ffffff")
      .style("filter", "drop-shadow(0 0 12px #ffffff)");
    d3.select(this).select("path").attr("stroke", "#ffffff");
  }).on("mouseout", function () {
    d3.select(this).select("circle")
      .attr("stroke", "#ff00ff")
      .style("filter", "drop-shadow(0 0 8px #ff00ff)");
    d3.select(this).select("path").attr("stroke", "#ff00ff");
  });

  function centerHoverHandler(e: any, node: D3HierarchyDiskItem) {
    centerHover(e, node);
  }
  function arcHoverHandler(e: any, node: D3HierarchyDiskItem) {
    arcHover(e, node);
  }
  function centerClickHandler(e: any, focusedNode: D3HierarchyDiskItem) {
    if (current === root) {
      return;
    }
    current = focusedNode;

    arcClicked(e, focusedNode);
    path = updateData(
      root,
      focusedNode,
      innerG,
      arcClickHandler,
      arcHoverHandler
    );
    backElement.datum(focusedNode.parent || root);
    animateToTarget(g, path);
  }

  function arcClickHandler(event: any, focusedNode: D3HierarchyDiskItem) {
    if (!focusedNode.children) {
      return;
    }

    current = focusedNode;
    arcClicked(event, focusedNode);
    path = updateData(
      root,
      focusedNode,
      innerG,
      arcClickHandler,
      arcHoverHandler
    );
    backElement.datum(focusedNode.parent || root);
    animateToTarget(g, path);
  }

  return {
    focusDirectory: (node: D3HierarchyDiskItem) => {
      arcClickHandler(null, node);
    },
    backToParent: (node: D3HierarchyDiskItem) => {
      centerClickHandler(null, node);
    },
    deleteNodes: (nodes: Array<D3HierarchyDiskItem>) => {
      nodes.forEach((node) => {
        node
          .ancestors()
          .slice(1)
          .forEach((anc) => {
            (anc as any).value -= node.value || 0;
            (anc as any).data.value -= node.value || 0;
          });
        node.parent!.children = node.parent!.children!.filter(
          (i: any) => i !== node
        );
      });
      root = d3.partition<DiskItem>().size([2 * Math.PI, root.height + 1])(
        root
      ) as D3HierarchyDiskItem;
      path = updateData(
        root,
        current,
        innerG,
        arcClickHandler,
        arcHoverHandler
      );
      animateToTarget(g, path);
    },
  };
};