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

    private $maxEdge = 0;

    public function build($data, $params = array()) {
        $this->maxEdge = isset($params['maxEdge']) ? $params['maxEdge'] : 0;
        foreach($data as $activity) {
            $post = $activity['post'];
            $postNode = $this->addNode(
                $post['actor']['id'],
                $post['actor']['displayName'],
                $post['actor']['image']['url']
            );
            $this->checkMax($postNode);

            $share = $activity['share'];
            if(isset($share)) {
                $share = $this->addNode(
                    $share['actor']['id'],
                    $share['actor']['displayName'],
                    $share['actor']['image']['url']
                );
                $postNode->addEdge($share);
                $this->checkMax($postNode);
                $this->checkMax($share);
            }

            $coms = $activity['comments'];
            if(isset($coms) && isset($coms["items"]))
                foreach($coms["items"] as $com) {
                    $com = $this->addNode(
                        $com['actor']['id'],
                        $com['actor']['displayName'],
                        $com['actor']['image']['url']
                    );
                    $com->addEdge($postNode);
                    $this->checkMax($com);
                    $this->checkMax($postNode);
                    /*if(isset($share))
                        $com->addEdge($share);*/
                }

            $coms = $activity['plus'];
            if(isset($coms) && isset($coms["items"]))
                foreach($coms["items"] as $com) {
                    $com = $this->addNode(
                        $com['id'],
                        $com['displayName'],
                        $com['image']['url']
                    );
                    $com->addEdge($postNode);
                    $this->checkMax($postNode);
                    $this->checkMax($com);
                }

            $coms = $activity['repost'];
            if(isset($coms) && isset($coms["items"]))
                foreach($coms["items"] as $com) {
                    $com = $this->addNode(
                        $com['id'],
                        $com['displayName'],
                        $com['image']['url']
                    );
                    $com->addEdge($postNode);
                    if(isset($share))
                        $com->addEdge($share);
                    $this->checkMax($postNode);
                    $this->checkMax($share);
                    $this->checkMax($com);
                }
        }
        $params['maxEdge'] = $this->maxEdge;
        return $this->nodes;
    }

    private function checkMax($node) {
        $this->maxEdge = $this->maxEdge < $node->data['$dim'] ? $node->data['$dim'] : $this->maxEdge;
    }

    public function getName() {
        return self::name;
    }

    private function addNode($id, $name, $img, $color = "#ff0000", $dim=0) {
        $node = $this->nodes[$this->index[$id]];
        if(!isset($node)) {
            $node = new Node();
            $node->id = $id;
            $node->name = $name;
            $node->data = array(
                '$dim' => $dim,
                '$color' => $color,
                '$img' => $img,
            );
            $this->nodes[] = $node;
            $this->index[$id] = count($this->nodes) - 1;
        }
        //$node->data['$dim']++;
        return $node;
    }
}
