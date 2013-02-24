// dynamic pie/donut chart using d3.js
// Robin Lucbernet - nibor.me 2012

(function( $ ){
    $.fn.pie = function( options ) {

        // pie settings
        var settings = $.extend( {
            'data': [],

            'data_url': '',
            'refresh_interval': 0,

            'title': "",

            'colors' : d3.scale.category20(),

            'height': 300,
            'width': 400,

            'animation_duration': 1300,
            'animation_type': 'elastic',

            'innerradius_percentage': 0.6,

            'display_labels': true,
            'display_title': true,
        }, options);

        radius_percentage=(settings.display_labels)?.3:.4
        var radius = Math.min(settings.height, settings.width) * radius_percentage

        var pie_layout = d3.layout.pie()
            .value(function(d) { return d.percentage })
            .sort(null);

        var arc = d3.svg.arc()
            .innerRadius(function(d) { return radius * settings.innerradius_percentage; })
            .outerRadius(function(d) { return radius; });

        function arcTween(a) {
            var i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function(t) {
                return arc(i(t));
            };
        }

        return this.each(function() {

            function fade(opacity, item_id) {
                return function(d, i) {
                    pie_group.selectAll(".to-fade")
                        .filter(function(d, k) { return k%settings.data.length != i; })
                        .transition()
                            .style("opacity", opacity);

                    $('.percentage_text').remove()
                    text_group
                        .append('svg:text')
                            .attr('class', 'percentage_text')
                            .attr('text-anchor', 'middle')
                            .attr('dominant-baseline', 'central')
                            .attr('font-weight', 'bold')
                            .attr('font-size', function() {
                                return radius*settings.innerradius_percentage / 1.5 + 'px'
                            })
                            .text(function() {
                                return (opacity!=1)?(d.value).toFixed(1).toString() + "%":''
                                return ret
                            })
                }
            }

            function draw_pie(data) {
                //title
                svg
                .append("svg:text")
                    .attr('class', 'title')
                    //.attr("x", 0+settings.width/2)
                    .attr("x", 0)
                    .attr("y", (-settings.height/2) + 15)
                    .attr("text-anchor", "middle")
                    //.attr("font-weight", "bold")
                    .attr("stroke", "black")
                    .text(function(d) { return settings.title; })

                //arcs
                pie_group.selectAll("path")
                    .data(data)
                    .enter().append("path")
                        .on("mouseover", fade(0.15))
                        .on("mouseout", fade(1))
                        .attr('class', "to-fade")
                        .attr("fill", function(d, i) { return settings.colors(i); })
                        .transition().duration(750).attrTween("d", arcTween) // redraw the arcs
                        .each(function(d) { this._current = d; }); // store the initial values

                if (settings.display_labels) {
                    // labels
                    pie_group.selectAll("text")
                        .data(data)
                        .enter().append('svg:text')
                            .attr('class', 'arc-label to-fade')
                            .attr("x", 0)
                            .attr("y", function(d) {
                                angle = ( (d.endAngle + d.startAngle) / 2 ) - Math.PI/2
                                return (angle > Math.PI/4 && angle < 3*Math.PI/4)?10:0
                            })
                            .attr("font-weight", "bold")
                            .attr('text-anchor', 'middle')
                            .attr("stroke", function(d, i) { return settings.colors(i) })
                            .text(function(d, i) { return settings.data[i].label; })
                            .attr("transform", function(d, i) {
                                angle = ( (d.endAngle + d.startAngle) / 2 ) - Math.PI/2
                                length_= Math.min(settings.height, settings.width)
                                offset = (i%2)?length_*0.05:length_*0.1
                                return "translate("+ Math.cos(angle) * (radius + offset)  +","+ Math.sin(angle) * (radius + offset) +")"
                            });

                    // labels lines
                    pie_group.selectAll("line").data(data)
                        .enter()
                            .append("svg:line")
                            .attr('class', 'label-line to-fade')
                            .attr("x1", 0)
                            .attr("x2", 0)
                            .attr("y1", -radius-3)
                            .attr("y2", function(d, index) {
                                //console.log('TOTOTO')
                                length_= Math.min(settings.height, settings.width)
                                offset = (index%2)?length_*0.05:length_*0.1
                                return -radius-2-offset
                            })
                            .attr("stroke", function(d, i) { return settings.colors(i) })
                               .attr("transform", function(d, i) {
                                    return "rotate(" + ( d.startAngle + ((d.endAngle - d.startAngle ) / 2) ) * (180 / Math.PI) + ")";
                                });
                }
            }

            function update_pie(data) {
                pie_group.selectAll("path").data(data)
                    .enter()
                    .append("path")
                        .on("mouseover", fade(0.15))
                        .on("mouseout", fade(1))
                        .attr('class', "to-fade")
                        .attr("fill", function(d, i) { return settings.colors(i); })
                        .transition().duration(750).attrTween("d", arcTween) // redraw the arcs
                        .each(function(d) { this._current = d; }); // store the initial values

                pie_group.selectAll("path").data(data)
                    .transition()
                    .ease(settings.animation_type)
                    .duration(settings.animation_duration).attrTween("d", arcTween); // redraw the arcs
                pie_group.selectAll("path").data(data)
                    .exit().remove()
                // labels lines
                pie_group.selectAll("text")
                        .data(data)
                        .enter().append('svg:text')
                            .attr('class', 'arc-label to-fade')
                            .attr("x", 0)
                            .attr("y", function(d) {
                                angle = ( (d.endAngle + d.startAngle) / 2 ) - Math.PI/2
                                return (angle > Math.PI/4 && angle < 3*Math.PI/4)?10:0
                            })
                            .attr("font-weight", "bold")
                            .attr('text-anchor', 'middle')
                            .attr("stroke", function(d, i) { return settings.colors(i) })
                            .text(function(d, i) { return settings.data[i].label; })
                            .attr("transform", function(d, i) {
                                angle = ( (d.endAngle + d.startAngle) / 2 ) - Math.PI/2
                                length_= Math.min(settings.height, settings.width)
                                offset = (i%2)?length_*0.05:length_*0.1
                                return "translate("+ Math.cos(angle) * (radius + offset)  +","+ Math.sin(angle) * (radius + offset) +")"
                            });

                pie_group.selectAll("line").data(data)
                    .transition()
                    .ease(settings.animation_type)
                    .duration(settings.animation_duration)
                           .attr("transform", function(d, i) {
                                return "rotate(" + ( d.startAngle + ((d.endAngle - d.startAngle ) / 2) ) * (180 / Math.PI) + ")";
                      });

                pie_group.selectAll("line").data(data)
                    .exit().remove()

                pie_group.selectAll("text").data(data)
                    .transition()
                    .ease(settings.animation_type)
                    .duration(settings.animation_duration)
                        .attr("transform", function(d, i) {
                            angle = ( (d.endAngle + d.startAngle) / 2 ) - Math.PI/2
                            length_= Math.min(settings.height, settings.width)
                            offset = (i%2)?length_*0.05:length_*0.1
                            return "translate("+ Math.cos(angle) * (radius + offset)  +","+ Math.sin(angle) * (radius + offset) +")"
                        });

                pie_group.selectAll("text").data(data)
                    .exit().remove()
            }

            var svg = d3.select(this).append("svg")
                .attr("width", settings.width)
                .attr("height", settings.height)
                .append("g")
                    .attr("transform", "translate(" + settings.width / 2 + "," + settings.height / 2 + ")");

            var text_group = svg.append("svg:g")
                .attr("class", "text_group")

            var pie_group = svg.append("svg:g")
                .attr("class", "pie_group")

            if (settings.data_url != '') {

                // get first data, and paint it
                $.get(settings.data_url, function(data) {
                    settings.data=data
                    draw_pie(pie_layout(data))
                }, "json")

                function update_data() {
                  $.get(settings.data_url, function(data) {
                        settings.data=data
                        update_pie(pie_layout(data))
                  }, "json")

                }

                // setup refresh interval if needed
                if (settings.refresh_interval != 0) {
                    var timer=setInterval(function () {
                            $.get(settings.data_url, function(data) {
                                update_pie(pie_layout(data))
                            }, "json")
                        },
                        settings.refresh_interval
                    );
                }
            }
            else {
                // paint it
                draw_pie(pie_layout(settings.data))
            }
    });

  };
})( jQuery );

function generate_random_data(x, show_percent) {

    number_of_items = parseInt((Math.random()*x)+1);

    //console.log('Generating ramdom data of', number_of_items, 'items')
    data = []

    for (i=0; i <= number_of_items-1; i++) {
        label = (show_percent)?'label'+i+' - '+ 100/number_of_items + '%':'label'+i
        data.push({
            percentage: 100/number_of_items,
            label: label
        })
    }
    //console.log('generated data', data)
    return data



}