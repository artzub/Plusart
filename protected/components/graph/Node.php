<?php
/**
 * Created by JetBrains PhpStorm.
 * User: Admin
 * Date: 04.02.12
 * Time: 4:27
 * To change this template use File | Settings | File Templates.
 */
class Node extends CComponent
{
    public $id;
    public $name;
    public $data = array();
    public $adjacencies = array();

    private  $index = array();

    public function addEdge($to) {
        $id = $this->id . '_' . $to->id;
        $edge = $this->adjacencies[$this->index[$id]];
        if(!isset($edge)) {
            $edge = new Edge();
            $edge->nodeFrom = $this->id;
            $edge->nodeTo = $to->id;
            $edge->data = array(
                '$color' => $this->data['$color']
            );
            $this->adjacencies[] = $edge;
            $this->index[$id] = count($this->adjacencies) - 1;
        }
        return $edge;
    }
}
