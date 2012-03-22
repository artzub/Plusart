(function(){
    if (typeof(window.isExists) == 'undefined' || window.isExists == null)
        window.isExists = function (obj) {
            return typeof(obj) != 'undefined' && obj != null
        };

    window.DirectGraphBuilder = function() {
        this.dataResult = [];
        this.dataResultIndexes = {};
        this.isExists = isExists;

        var Node = function(id, name, url) {
            this.id = id;
            this.name = name;
            this.data = {$dim : 0, img : url};
            this.adjacencies = [];
            this.adjIndex = {};
        };

        Node.prototype.addEdge = function(to) {
            if (!to)
                return false;

            if (this.id == to.id)
                return false;

            var id = this.id + '_' + to.id;

            var ind = this.adjIndex[id];

            var edge = null;
            if (isExists(ind))
                edge = this.adjacencies[ind];

            if(!isExists(edge)) {
                edge = {
                    data : {
                        $color : this.data.$color
                    },
                    nodeTo : to.id,
                    nodeFrom : this.id
                }
                this.adjacencies.push(edge);
                this.adjIndex[id] = this.adjacencies.length - 1;
                this.data.$dim++;
                to.data.$dim++;
            }

            return edge;
        }

        this.addNode = function(id, name, url) {
            var ind = this.dataResultIndexes[id];
            var node = null;
            if (this.isExists(ind))
                node = this.dataResult[ind];

            if(!this.isExists(node)) {
                node = new Node(id, name, url);
                this.dataResult.push(node);
                this.dataResultIndexes[id] = this.dataResult.length - 1;
            }
            return node;
        }
    };

    DirectGraphBuilder.prototype.Clear = function() {
        this.dataResult = [];
        this.dataResultIndexes = {};
    };

    DirectGraphBuilder.prototype.dataGenerator = function(dataIndexes) {
        if (!dataIndexes)
            return;

        for(var key in dataIndexes) {
            var cur = dataIndexes[key];

            var post = cur.post;
            var postNode = this.addNode(post.actor.id,
                post.actor.displayName, post.actor.image.url);

            var share = cur.share;
            if (this.isExists(share)) {
                share = this.addNode(share.actor.id,
                    share.actor.displayName, share.actor.image.url);
                postNode.addEdge(share);
            }

            var coms = cur.comments;
            if (this.isExists(coms) && coms.length > 0) {
                var count = coms.length;
                for(var i = 0; i < count; i++) {
                    var com = this.addNode(
                        coms[i].actor.id,
                        coms[i].actor.displayName,
                        coms[i].actor.image.url
                    );
                    com.addEdge(postNode);
                }
            }

            var coms = cur.plusoners;
            if (this.isExists(coms) && coms.length > 0) {
                var count = coms.length;
                for(var i = 0; i < count; i++) {
                    var com = this.addNode(
                        coms[i].id,
                        coms[i].displayName,
                        coms[i].image.url
                    );
                    com.addEdge(postNode);
                }
            }

            var coms = cur.sharers;
            if (this.isExists(coms) && coms.length > 0) {
                var count = coms.length;
                for(var i = 0; i < count; i++) {
                    var com = this.addNode(
                        coms[i].id,
                        coms[i].displayName,
                        coms[i].image.url
                    );
                    com.addEdge(postNode);
                }
            }
        }
    };
})();