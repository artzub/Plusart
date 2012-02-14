<?=CHtml::tag('div', $htmlOptions, "");?>

<div class="form" id="form_config">

    <div class="row">
        <?php echo CHtml::label('Type calc bezier', 'typeEdgeDraw'); ?>
        <?php echo CHtml::dropDownList('typeEdgeDraw', 'orientation',
            array('orientation', 'direction'), array('id' => 'typeEdgeDraw')); ?>
    </div>

    <div class="row">
        <?php echo CHtml::label('Zooming', 'zooming'); ?>
        <?php echo CHtml::textField('zooming', '20', array('id' => 'zooming', 'type' => 'number')) ?>
    </div>

    <div class="row">
        <?php echo CHtml::label('Type shape node', 'nodeType'); ?>
        <?php echo CHtml::dropDownList('nodeType', 'circle',
            array('none', 'circle', 'ellipse', 'square', 'rectangle', 'triangle', 'star'), array('id' => 'nodeType')); ?>
    </div>

    <div class="row">
        <?php echo CHtml::label('Type edge', 'edgeType'); ?>
        <?php echo CHtml::dropDownList('edgeType', 'bezier',
            array('none', 'bezier', 'line', 'arrow'), array('id' => 'edgeType')); ?>
    </div>

    <div class="row">
        <?php echo CHtml::label('Edge dim', 'edgeDim'); ?>
        <?php echo CHtml::textField('edgeDim', '50', array('id' => 'edgeDim', 'type' => 'number')) ?>
    </div>

    <? if(false) : ?>
    <div class="row">
        <?php echo CHtml::label('Type label', 'labelType'); ?>
        <?php echo CHtml::dropDownList('labelType', 'Native',
            array('Native', 'HTML', 'SVG'), array('id' => 'labelType')); ?>
    </div>
    <? endif ?>

    <div class="row">
        <?php echo CHtml::label('Edge dim', 'iterations'); ?>
        <?php echo CHtml::textField('iterations', '1000', array('id' => 'iterations', 'type' => 'number')) ?>
    </div>

    <div class="row">
        <?php echo CHtml::label('Edge length', 'levelDistance'); ?>
        <?php echo CHtml::textField('levelDistance', '260', array('id' => 'levelDistance', 'type' => 'number')) ?>
    </div>

    <div class="row">
        <?php echo CHtml::label('Step update when computing', 'iter'); ?>
        <?php echo CHtml::textField('iter', '20', array('id' => 'iter', 'type' => 'number')) ?>
    </div>

    <div class="row">
        <?php echo CHtml::checkBox('stepAnim', true, array('id' => 'stepAnim')) ?>
        <?php echo CHtml::label('Animate when computing?', 'stepAnim'); ?>
    </div>

    <?=CHtml::submitButton('Refresh', array('id' => 'refreshGraph'));?>

</div><!-- form -->

<script type="text/javascript">
    var configGraph = {
        'typeEdgeDraw' : "orientation", //"direction"
        'listTypeEdgeDraw' : ['orientation', 'direction'],
        'zooming' : 20,
        'nodeType' : 'circle',
        'listNodeType' : ['none', 'circle', 'ellipse', 'square', 'rectangle', 'triangle', 'star'],
        'edgeType' : 'bezier', //line or arrow
        'listEdgeType' : ['none', 'bezier', 'line', 'arrow'],
        'edgeDim' : 50, //use for bezier
        'labelType' : labelType,
        'listLabelType' : nativeTextSupport ? ['Native' , 'HTML'] : ['HTML'],
        'iterations' : 1000,
        'levelDistance' : 260,
        'iter' : 20,
        'stepAnim' : true
    }

    var <?=$objectName?>;

    $jit.ForceDirected.Plot.EdgeTypes.implement({
        'bezier': {
            'render': function(adj, canvas) {
                var orn = "left",
                    nodeFrom = adj.nodeFrom.pos.getc(true),
                    nodeTo = adj.nodeTo.pos.getc(true),
                    dim = adj.getData('dim'),
                    ctx = canvas.getCtx(),
                    vd = (adj.nodeFrom.data.$dim || 0),
                    ud = (adj.nodeTo.data.$dim || 0),
                    bx = nodeFrom.x,
                    by = nodeFrom.y,
                    ex = nodeTo.x,
                    ey = nodeTo.y;
                ctx.beginPath();
                ctx.moveTo(nodeFrom.x, nodeFrom.y);

                var del = ud / 3;

                orn = "top";
                if(bx + del < ex) {
                    orn = "right";
                    if(by - del > ey)
                        orn = "bottomright";
                    else if (by + del < ey)
                        orn = "topright";
                }
                else if(bx - del > ex) {
                    orn = "left";
                    if(by - del > ey)
                        orn = "bottomleft";
                    else if (by + del < ey)
                        orn = "topleft";
                }
                else if(by > ey) {
                    orn = "bottom";
                }

                switch(configGraph.typeEdgeDraw) {
                    case "orientation" :
                        switch(orn) {
                            case "left":
                                ctx.bezierCurveTo(bx + dim, by, ex - dim, ey, ex, ey);
                            break;
                            case "right":
                                ctx.bezierCurveTo(bx - dim, by, ex + dim, ey, ex, ey);
                            break;
                            case "top":
                                ctx.bezierCurveTo(bx, by + dim, ex, ey - dim, ex, ey);
                            break;
                            case "bottom":
                                ctx.bezierCurveTo(bx, by - dim, ex, ey + dim, ex, ey);
                            break;
                            case "topleft" :
                                ctx.bezierCurveTo(bx + dim, by + dim, ex - dim, ey - dim, ex, ey);
                            break;
                            case "topright" :
                                ctx.bezierCurveTo(bx - dim, by + dim, ex + dim, ey - dim, ex, ey);
                            break;
                            case "bottomleft" :
                                ctx.bezierCurveTo(bx + dim, by - dim, ex - dim, ey + dim, ex, ey);
                            break;
                            case "bottomright" :
                                ctx.bezierCurveTo(bx - dim, by - dim, ex + dim, ey + dim, ex, ey);
                            break;
                        }
                    break;
                    case "direction" :
                        if (vd < ud)
                            ctx.bezierCurveTo(nodeFrom.x - dim, nodeFrom.y + dim, nodeTo.x + dim, nodeTo.y - dim, nodeTo.x, nodeTo.y);
                        else
                            ctx.bezierCurveTo(nodeFrom.x + dim, nodeFrom.y - dim, nodeTo.x - dim, nodeTo.y + dim, nodeTo.x, nodeTo.y);
                    break;
                }
             ctx.stroke();
           }
      }
    });

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
          zooming: configGraph.zooming //zoom speed. higher is more sensible
        },
        // Change node and edge styles such as
        // color and width.
        // These properties are also set per node
        // with dollar prefixed data-properties in the
        // JSON structure.
        Node: {
          overridable: true,
          type : configGraph.nodeType
        },
        Edge: {
          overridable: true,
          type: configGraph.edgeType,
          color: '#23A4FF',
          lineWidth: 1,
          dim: configGraph.edgeDim
        },
        //Native canvas text styling
        Label: {
          type: configGraph.labelType, //Native or HTML
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
            tip.innerHTML = (node.data.$img ? '<img src="' + node.data.$img + '" alt="' + node.name + '" />' : '') +
                "<div class='jit_tip-cont'><div class=\"jit_tip-title\">" + node.name + "</div>" +
                "<div class=\"jit_tip-text\"><b>connections:</b> " + count + "</div></div>";
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
            var html = (node.data.$img ? '<img src="' + node.data.$img + '" alt="' + node.name + '" />' : '') +
                    "<h4>" + node.name + "</h4><b> connections:</b><ul><li>",
                list = [];
            node.eachAdjacency(function(adj){
              list.push('<a href="https://plus.google.com/' + adj.nodeTo.id +'" target="_blank">' +
                (adj.nodeTo.data.$img ? '<img src="' + adj.nodeTo.data.$img + '" alt="' + adj.nodeTo.name + '" />' : '')  + adj.nodeTo.name + '</a>');
            });
            //append connections information
            $jit.id('jit_inner-details').innerHTML = html + list.join("</li><li>") + "</li></ul>";
          }
        },
        //Number of iterations for the FD algorithm
        iterations: configGraph.iterations,
        //Edge length
        levelDistance: configGraph.levelDistance,
        // Add text to the labels. This method is only triggered
        // on label creation and only for DOM labels (not native canvas ones).
        onCreateLabel: function(domElement, node){
          domElement.innerHTML =
              (false && (node.data.$dim || 0) > 50 && node.data.$img ? '<img src="' + node.data.$img + '" alt="' + node.name + '" />' : '') + node.name;
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
        compute_<?=$objectName?>();
        // end
    };

    function compute_<?=$objectName?>() {
        // compute positions incrementally and animate.
        <?=$objectName?>.fd.computeIncremental({
            iter: configGraph.iter,
            property: 'end',
            onStep: function(perc){
                Log.write(perc + '% compute...');
                if(!configGraph.stepAnim) return;
                <?=$objectName?>.fd.animate({
                    modes: ['linear'],
                    transition: $jit.Trans.Elastic.easeOut,
                    duration: 3000
                });
            },
            onComplete: function(){
                Log.write('done');
                <?=$objectName?>.fd.animate({
                    modes: ['linear'],
                    transition: $jit.Trans.Elastic.easeOut,
                    duration: 5000
                });
            }
        });
    }

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