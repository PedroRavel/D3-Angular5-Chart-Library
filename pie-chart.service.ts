import * as d3 from 'd3';
import { Injectable } from '@angular/core';

@Injectable()
export class PieChart {

    private pieData: any = [];
    private init = false;
    public renderPieChart(width: any, height: any, data: any, elem: any) {
        this.parseData(data);
        const color = d3.scaleOrdinal()
            .range(['#002aff', '#f90101']);
        const radius = Math.min(width, height) / 2;

        const arc = d3.arc()
            .outerRadius(radius - 10)
            .innerRadius(0);

        const labelArc = d3.arc()
            .outerRadius(radius - 40)
            .innerRadius(radius - 40);

        const pie = d3.pie()
            .sort(null)
            .value(function(d) { return d; });

        const svg = d3.select(elem).append("svg")
            .attr("width", width)
            .attr("height",height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        const g = svg.selectAll(".arc")
            .data(pie(this.pieData))
            .enter().append("g")
            .attr("class", "arc");

        g.append("path")
            .attr("d", arc)
            .style("fill", function(d) { return color(d.data); });

        g.append("text")
            .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
            .attr("dy", ".35em")
            .text(function(d) { return d.data; });
    }

    private parseData(data) {
        let success = [];
        let failures = [];
        if(this.init === false) {
            success = data.allSuccesses.map((d) => {
                return d.value;
            })
            failures = data.allFailures.map((d) => {
                return d.value;
            })

            this.pieData.push(this.sum(success));
            this.pieData.push(this.sum(failures));
            this.init = true;
        
        }

    }

    private sum(numbers) {
        return numbers.reduce(function(a,b) {
          return a + b
        });
      }


}