<?=CHtml::tag('div', $htmlOptions, "");?>
<script type="text/javascript">
    var <?=$objectName?>;

    function init_<?=$htmlOptions['id']?>(){
      // init ForceDirected
      return new $jit.ForceDirected({
        //id of the visualization container
        injectInto: "<?=$htmlOptions['id']?>",
        //Enable zooming and panning
        //by scrolling and DnD
        Navigation: {
          enable: true,
          //Enable panning events only if we're dragging the empty
          //canvas (and not a node).
          panning: 'avoid nodes',
          zooming: 10 //zoom speed. higher is more sensible
        },
        // Change node and edge styles such as
        // color and width.
        // These properties are also set per node
        // with dollar prefixed data-properties in the
        // JSON structure.
        Node: {
          overridable: true
        },
        Edge: {
          overridable: true,
          color: '#23A4FF',
          lineWidth: 0.4
        },
        //Native canvas text styling
        Label: {
          type: labelType, //Native or HTML
          size: 10,
          style: 'bold'
        },
        //Add Tips
        Tips: {
          enable: true,
          onShow: function(tip, node) {
            //count connections
            var count = 0;
            node.eachAdjacency(function() { count++; });
            //display node info in tooltip
            tip.innerHTML = "<div class=\"jit_tip-title\">" + node.name + "</div>"
              + "<div class=\"jit_tip-text\"><b>connections:</b> " + count + "</div>";
          }
        },
        // Add node events
        Events: {
          enable: true,
          //Change cursor style when hovering a node
          onMouseEnter: function() {
            <?=$objectName?>.fd.canvas.getElement().style.cursor = 'move';
          },
          onMouseLeave: function() {
            <?=$objectName?>.fd.canvas.getElement().style.cursor = '';
          },
          //Update node positions when dragged
          onDragMove: function(node, eventInfo, e) {
              var pos = eventInfo.getPos();
              node.pos.setc(pos.x, pos.y);
              <?=$objectName?>.fd.plot();
          },
          //Implement the same handler for touchscreens
          onTouchMove: function(node, eventInfo, e) {
            $jit.util.event.stop(e); //stop default touchmove event
            this.onDragMove(node, eventInfo, e);
          },
          //Add also a click handler to nodes
          onClick: function(node) {
            if(!node) return;
            // Build the right column relations list.
            // This is done by traversing the clicked node connections.
            var html = "<h4>" + node.name + "</h4><b> connections:</b><ul><li>",
                list = [];
            node.eachAdjacency(function(adj){
              list.push(adj.nodeTo.name);
            });
            //append connections information
            $jit.id('jit_inner-details').innerHTML = html + list.join("</li><li>") + "</li></ul>";
          }
        },
        //Number of iterations for the FD algorithm
        iterations: 200,
        //Edge length
        levelDistance: 130,
        // Add text to the labels. This method is only triggered
        // on label creation and only for DOM labels (not native canvas ones).
        onCreateLabel: function(domElement, node){
          domElement.innerHTML = node.name;
          var style = domElement.style;
          style.fontSize = "0.8em";
          style.color = "#ddd";
        },
        // Change node styles when DOM labels are placed
        // or moved.
        onPlaceLabel: function(domElement, node){
          var style = domElement.style;
          var left = parseInt(style.left);
          var top = parseInt(style.top);
          var w = domElement.offsetWidth;
          style.left = (left - w / 2) + 'px';
          style.top = (top + 10) + 'px';
          style.display = '';
        }
      });
    }

    function run_<?=$htmlOptions['id']?>(data) {
        var jsondata = data;
        // load JSON data.
        <?=$objectName?>.fd.loadJSON(jsondata);
        // compute positions incrementally and animate.
        <?=$objectName?>.fd.computeIncremental({
            iter: 40,
            property: 'end',
            onStep: function(perc){
                Log.write(perc + '% loaded...');
            },
            onComplete: function(){
                Log.write('done');
                <?=$objectName?>.fd.animate({
                    modes: ['linear'],
                    transition: $jit.Trans.Elastic.easeOut,
                    duration: 2500
                });
            }
        });
      // end
    };
    <?=$objectName?>.run = run_<?=$htmlOptions['id']?>;

    if(document.addEventListener) {   // Mozilla, Opera, Webkit are all happy with this
        document.addEventListener("DOMContentLoaded", function()
        {
            document.removeEventListener( "DOMContentLoaded", arguments.callee, false);
            <?=$objectName?>.fd = init_<?=$htmlOptions['id']?>();
        }, false);
    }
    else if(document.attachEvent) {   // IE is different...
        document.attachEvent("onreadystatechange", function()
        {
            if(document.readyState === "complete") {
                document.detachEvent("onreadystatechange", arguments.callee);
                <?=$objectName?>.fd = init_<?=$htmlOptions['id']?>();
            }
        });
    }
</script>