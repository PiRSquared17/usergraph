var svg, nodes = {}, links = [];
function drawGraph(wiki, limit, append, user) { // get the data
    var user_q = user.replace(/\s/g,'').length ? ("&user=" + encodeURIComponent(user)) : "&top=1";
    var limit_q = typeof limit == "undefined" ? "&limit=300" : ("&limit=" + encodeURIComponent(limit));
    d3.json("api.php?wiki=" + encodeURIComponent(wiki) + user_q + limit_q, function(error, elinks) {

            nodes = append ? nodes : {};

            // Compute the distinct nodes from the links.
            elinks.forEach(function(link) {
                link.source = nodes[link.source] ||
                    (nodes[link.source] = {
                        name: link.source
                    });
                link.target = nodes[link.target] ||
                    (nodes[link.target] = {
                        name: link.target
                    });
                link.value = +link.value;
            });
            links = append ? elinks.concat(links) : elinks;

            var margin = {
                    top: -5,
                    right: -5,
                    bottom: -5,
                    left: -5
                },
                width = 1.8 * 960 - margin.left - margin.right,
                height = 3 * 500 - margin.top - margin.bottom;

            var force = d3.layout.force()
                .nodes(d3.values(nodes))
                .links(links)
                .linkDistance(15)
                .linkStrength(2)
                .size([width, height])
                //.size([width + margin.left + margin.right, height + margin.top + margin.bottom])
                .linkDistance(90)
                .charge(-300)
                .on("tick", tick)
                .start();

            /*var force = d3.layout.force()
                .start();*/

                svg.selectAll("*").remove();
                svg = svg.attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);
                svg.append("g");
            var container = svg;
            // build the arrow.
            container.append("svg:defs").selectAll("marker")
                .data(["end"])
                .enter().append("svg:marker")
                .attr("id", String)
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 15)
                .attr("refY", -1.5)
                .attr("markerWidth", 6)
                .attr("markerHeight", 6)
                .attr("orient", "auto")
                .append("svg:path")
                .attr("d", "M0,-5L10,0L0,5");

            // add the links and the arrows
            var path = container.append("svg:g").selectAll("path")
                .data(force.links())
                .enter().append("svg:path")
                .attr("class", "link")
                .attr("marker-end", "url(#end)");

            // define the nodes
            var node = container.selectAll(".node")
                .data(force.nodes())
                .enter().append("g")
                .attr("class", "node")
                .call(force.drag);

            // add the nodes
            node.append("circle")
                .attr("r", 5);

            // add the text 
            node.append("text")
                .attr("x", 12)
                .attr("dy", ".35em")
                .text(function(d) {
                    return d.name;
                });

            // add the curvy lines
            function tick() {
                path.attr("d", function(d) {
                    var dx = d.target.x - d.source.x,
                        dy = d.target.y - d.source.y,
                        dr = Math.sqrt(dx * dx + dy * dy);
                    return "M" +
                        d.source.x + "," +
                        d.source.y + "A" +
                        dr + "," + dr + " 0 0,1 " +
                        d.target.x + "," +
                        d.target.y;
                });

                node
                    .attr("transform", function(d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    });
            }

        });

}
$(function() {
svg = d3.select("body").append("svg");
    $('#form').on('submit', function(event) {
        event.preventDefault();
        drawGraph($('#p').val(), $('#l').val(), $('#a').is(':checked'), $('#u').val());
    });
});
