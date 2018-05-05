import { Injectable } from '@angular/core';
import * as d3 from 'd3';

@Injectable()
export class BarGraph {
  
  private barGraph: any = {}
  private margin = { top: 50, right: 30, bottom: 40, left: 50 };
  
  constructor() { }

  public renderBarGraph(width: number, height: number, data: any, elem: any, title: any) {
    const canvasWidth = width - this.margin.left - this.margin.right;
    const canvasHeight = height - this.margin.top - this.margin.bottom;
    this.barGraph.canvasWidth = canvasWidth;
    this.barGraph.canvasHeight = canvasHeight;
    this.barGraph.width = width;
    this.barGraph.height = height;
    this.barGraph.dataObject = data;
    this.barGraph.elem = elem;
    this.barGraph.leftRightPadding = 50;
    this.barGraph.data = [
        data.allSuccesses,
        data.allFailures
    ];
    this.barGraph.title = title;
    this.barGraph.parsedData = this.parseData(this.barGraph);
    this.barGraph.maxBarWidth = this.barGraph.parsedData[0].data.length !== 0 ? Math.floor(100 / this.barGraph.parsedData[0].data.length) : 0;
    this.initSvg(this.barGraph);
    this.initAxis(this.barGraph);
    this.drawAxis(this.barGraph);
    this.drawBars(this.barGraph);
    this.setTextAndSquaresForText(this.barGraph);
  }

  private initSvg(graphObject: any) {

    graphObject.svg = d3.select(graphObject.elem)
                 .append('svg')
                 .attr('width', graphObject.width)
                 .attr('height', graphObject.height);
    const rectWidthOffset = 2;
    const rectHeightOffset = 2;
    const rectWidth = graphObject.width - rectWidthOffset;
    const rectHeight = graphObject.height - rectHeightOffset;
    graphObject.svg.append('rect')
    .attr('class', 'canvas-rect')
    .attr('width', rectWidth)
    .attr('height', rectHeight)
    .attr('fill','white')
    .attr('stroke-width', 1)
    .attr('stroke', 'grey')
    .attr('transform', `translate(${1}, ${1})`);

    graphObject.svg.g = graphObject.svg.append('g')
    .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
  }

  private initAxis(graphObject: any) {
    const domainForBarGroup = d3.range(graphObject.parsedData[0].data.length);
    const range = this.determineRange(graphObject);
    graphObject.x = d3.scaleOrdinal(range);
    graphObject.xGroup = d3.scaleBand().domain(domainForBarGroup).rangeRound([ 0, graphObject.maxBarWidth * domainForBarGroup.length ]);
    graphObject.y = d3.scaleLinear().rangeRound([graphObject.canvasHeight, 0]);
    graphObject.x.domain(graphObject.parsedData.map((d) => d.name));
    graphObject.y.domain(this.calculateMinMaxYValueForBar(graphObject));
  }

  private drawAxis(graphObject: any) {

    graphObject.svg.g.append("g")
          .attr("class", "axis axis--x")
          .attr("transform", "translate(0," + graphObject.canvasHeight + ")")
          .call(d3.axisBottom(graphObject.x))
          .select('.domain')
          .remove();

    graphObject.svg.g.append("g")
          .attr("class", "axis axis--y")
          .call(d3.axisLeft(graphObject.y))          
          .select('.domain')
          .remove();

    d3.select('.axis--y').selectAll('text').attr('font-size', '1.5em').attr('font-family', 'Verdana');
    d3.select('.axis--x').selectAll('text').attr('font-size', '1.5em').attr('font-family', 'Verdana');
  }

  private drawBars(graphObject: any) {
    graphObject.svg.g.append('g')
    .selectAll('groupGraphRect')
    .data(graphObject.parsedData).enter().append('g')
    .attr('class', 'groupGraphRect')
    .attr('transform', function (d) { return `translate(${graphObject.x(d.name)}, 0)`; })
    .selectAll('.rect').data(function (d) { return d.data; })
    .enter().append('rect').attr('class', 'bar')
    .attr('x', function (d, i) { return graphObject.xGroup(i) - graphObject.leftRightPadding; })
    .attr('width', graphObject.maxBarWidth)
    .attr('y', function (d) { return graphObject.y(d.value); })
    .attr('height', function (d) { return graphObject.canvasHeight - graphObject.y(d.value); })
    .attr('fill', function (d) { return d.color; })
    .attr('stroke-width', 2)
    .attr('stroke', 'black');
  }

  private setTextAndSquaresForText(graphObject: any) {
    graphObject.svg.g.append('text')
    .attr('transform', `translate(${20}, ${0})`)
    .text(`${this.barGraph.title}`)
    .attr('font-size', '1.2em')
    .attr('font-family', 'Verdana');
    const text = ['Success', 'Failures']
    const color = [ '#002aff', '#f90101']; 
    const yOffset = 0;
    const rectYOffset = yOffset - 11;
    for (let i = 0; i < graphObject.parsedData[0].data.length; i++) {
      const xOffset = graphObject.canvasWidth / 5 * i + graphObject.canvasWidth / 3;
      const rectXOffset = xOffset + 70;
      graphObject.svg.g.append('rect')
        .attr('transform', `translate(${rectXOffset}, ${rectYOffset})`)
        .attr('fill', color[i])
        .attr('width', 20)
        .attr('height', 12);

  
      graphObject.svg.g.append('text')
        .text(text[i])
        .attr('transform', `translate(${xOffset}, ${yOffset})`)
        .attr('class', 'legend-text')
        .attr('font-size', '1.2em')
        .attr('font-family', 'Verdana');
    }
  }

  private parseData(graphObject: any) {
    const parsedData = [];
    const firstIndex = 0;
    const secondIndex = 1;
    for(let i = 0; i < graphObject.data[firstIndex].length; i++) {
        graphObject.data[firstIndex][i].color = '#002aff';
        graphObject.data[secondIndex][i].color = '#f90101';
        parsedData.push({ name: graphObject.data[firstIndex][i].name, data: [ graphObject.data[firstIndex][i], graphObject.data[secondIndex][i] ] });
    }
    return parsedData;
  }

  private calculateMinMaxYValueForBar(graphObject: any) {
    const arrayOfMaxValues = [];
    const arrayOfMinValues = [];
    graphObject.parsedData.forEach(function (bars) {
      arrayOfMaxValues.push(d3.max(bars.data, function (d) { return d.value; }));
      arrayOfMinValues.push(d3.min(bars.data, function (d) { return d.value; }));
    });
    const max = d3.max(arrayOfMaxValues);
    const min = d3.min(arrayOfMinValues) >= 0 ? 0 : d3.min(arrayOfMinValues);
    return [ min, max ];
  }

  private determineRange(graphObject: any) {
    const range = [ ];
    range.push(graphObject.leftRightPadding);
    const rangePercent = 1 / (graphObject.data[0].length - 1);
    for (let i = 1; i < graphObject.data[0].length; i++) {
      range.push(graphObject.canvasWidth *  (rangePercent * i));
    }
    range[range.length - 1] = range[range.length - 1] - graphObject.leftRightPadding;
    return range;
  }


}
