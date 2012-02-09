<?php
/**
 * @author: ArtZub <artzub@gmail.com>
 */

require_once "IGraphBuilder.php";

class DirectGraphBuilder extends CComponent implements IGraphBuilder
{
    static $name = "DirectGraphBuilder";

    private $nodes = array();

    private $index = array();

    public function build($data, $params = array()) {

        foreach($data as $activity) {
            $post = $activity['post'];
            $postNode = $this->addNode(
                $post['actor']['id'],
                $post['actor']['displayName']
            );

            $share = $activity['share'];
            if(isset($share)) {
                $share = $this->addNode(
                    $share['actor']['id'],
                    $share['actor']['displayName']
                );
                $postNode->addEdge($share);
                $postNode = $share;
            }

            $coms = $activity['comments'];
            if(isset($coms) && isset($coms["items"]))
                foreach($coms["items"] as $com) {
                    $com = $this->addNode(
                        $com['actor']['id'],
                        $com['actor']['displayName']
                    );
                    $com->addEdge($postNode);
                }

            $coms = $activity['plus'];
            if(isset($coms) && isset($coms["items"]))
                foreach($coms["items"] as $com) {
                    $com = $this->addNode(
                        $com['id'],
                        $com['displayName']
                    );
                    $com->addEdge($postNode);
                }

            $coms = $activity['repost'];
            if(isset($coms) && isset($coms["items"]))
                foreach($coms["items"] as $com) {
                    $com = $this->addNode(
                        $com['id'],
                        $com['displayName']
                    );
                    $com->addEdge($postNode);
                }
        }

        return $this->nodes;
    }

    public function getName() {
        return self::name;
    }

    private function addNode($id, $name, $color = "#ff0000", $dim=0) {
        $node = $this->nodes[$this->index[$id]];
        if(!isset($node)) {
            $node = new Node();
            $node->id = $id;
            $node->name = $name;
            $node->data = array(
                '$dim' => $dim,
                '$color' => $color
            );
            $this->nodes[] = $node;
            $this->index[$id] = count($this->nodes) - 1;
        }
        $node->data['$dim']++;
        return $node;
    }
}
