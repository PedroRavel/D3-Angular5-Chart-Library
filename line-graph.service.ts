
import * as d3 from 'd3';
import { Injectable } from '@angular/core';

@Injectable()
export class LineGraph{
  private lineGraph: any = {}
  private margin = { top: 50, right: 30, bottom: 40, left: 50 };

  constructor() { }

  public renderLineGraph(width: number, height: number, data: any, elem: any, title: any) {
    const canvasWidth = width - this.margin.left - this.margin.right;
    const canvasHeight = height - this.margin.top - this.margin.bottom;
    this.lineGraph.canvasWidth = canvasWidth;
    this.lineGraph.canvasHeight = canvasHeight;
    this.lineGraph.width = width;
    this.lineGraph.height = height;
    this.lineGraph.dataObject = data;
    this.lineGraph.elem = elem;
    this.lineGraph.leftRightPadding = 25;
    this.lineGraph.data = [];
    this.lineGraph.title = title;
    this.transformObject(this.lineGraph);
    this.initSvg(this.lineGraph);
    this.initAxis(this.lineGraph);
    this.drawAxis(this.lineGraph);
    this.drawLine(this.lineGraph);
    this.drawPoints(this.lineGraph);
    this.setTextAndSquaresForText(this.lineGraph);
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
    const range = this.determineRange(graphObject);
    graphObject.x = d3.scaleOrdinal(range);
    graphObject.y = d3.scaleLinear().rangeRound([graphObject.canvasHeight, 0]);
    graphObject.x.domain(graphObject.data[0].map(function (d) { return d.name.toUpperCase()}));
    const minMax = this.calculateMinMaxYValueForBar(graphObject);
    graphObject.y.domain(minMax);
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

  private drawLine(graphObject: any) {
    graphObject.line = d3.line()
                         .x( (d: any) => graphObject.x(d.name))
                         .y( (d: any) => graphObject.y(d.value))
                         .curve(d3.curveCardinal);

    graphObject.area = d3.area()
                         .x(function (d) { return graphObject.x(d.name); })
                         .y0(graphObject.canvasHeight)
                         .y1(function (d) { return graphObject.y(d.value); })
                         .curve(d3.curveCardinal);

    graphObject.data.forEach((d, i) => {
      graphObject.svg.g.append('path')
      .data([ d ])
      .attr('d', graphObject.line)
      .attr('fill','none')
      .attr('stroke', d.color)
      .attr('stroke-width','3px');

    graphObject.svg.g.append('path')
      .data([ d ])
      .attr('d', graphObject.area)
      .attr('fill', d.color)
      .attr('stroke', d.color)
      .attr('opacity', () => {
        if(i === 0) {
          return 0.4;
        } else {
          return 0.7;
        }
      })
    })

  }

  private drawPoints(graphObject: any) {
    graphObject.data.forEach((dataPoints, i) => {
      graphObject.svg.g.selectAll(`.circles`)
        .data(dataPoints)
        .enter().append('circle')
        .attr('class', 'circle')
        .attr('r', 6)
        .attr('fill', function (d) {
          return graphObject.data[i].color;
        })
        .attr('cx', function (d) {
          return graphObject.x(d.name);
        })
        .attr('cy', function (d) {
          return graphObject.y(d.value);
        });
    })
  }

  private setTextAndSquaresForText(graphObject: any) {
    graphObject.svg.g.append('text')
    .attr('transform', `translate(${20}, ${0})`)
    .text(`${this.lineGraph.title}`)
    .attr('font-size', '1.2em')
    .attr('font-family', 'Verdana');
    const text = ['Success', 'Failures']
    const color = ['#002aff', '#f90101'] 
    const yOffset = 0;
    const rectYOffset = yOffset - 11;
    for (let i = 0; i < graphObject.data.length; i++) {
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

  private transformObject(graphObject: any) {
    for (var key in graphObject.dataObject) {
      if (graphObject.dataObject.hasOwnProperty(key)) {
        graphObject.data.push(graphObject.dataObject[key]);
      }
    }

    let successIndex = 0;
    let failureIndex = 1;

    graphObject.data[successIndex].color = '#002aff';
    graphObject.data[failureIndex].color = '#f90101';

    let isFirstArrayInFront = false;
    let max = 0;

    graphObject.data.forEach((d, i) => {
      if(d3.max(d, function (d) { return d.value; }) > max) {
        max = d3.max(d, function (d) { return d.value; });
        if(i == graphObject.data.length - 1) {
          isFirstArrayInFront = true;
        }
      } 
      if(isFirstArrayInFront === true) {
          graphObject.data.reverse();
      }
    })
  }

  private calculateMinMaxYValueForBar(graphObject: any) {
    const arrayOfMaxValues = [];
    const arrayOfMinValues = [];
    graphObject.data.forEach((graphData) => {
      arrayOfMaxValues.push(d3.max(graphData, function (d) { return d.value; }));
      arrayOfMinValues.push(d3.min(graphData, function (d) { return d.value; }));
    });
    const max = d3.max(arrayOfMaxValues);
    const min = d3.min(arrayOfMinValues) >= 0 ? 0 : d3.min(arrayOfMinValues);
    return [ min, max ];
  }

}
