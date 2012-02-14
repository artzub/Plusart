<?php
/**
 * Created by JetBrains PhpStorm.
 * User: Admin
 * Date: 04.02.12
 * Time: 5:20
 * To change this template use File | Settings | File Templates.
 */

class Grapher extends CComponent
{
    private $plus;
    private $builder;
    private $maxEdge;

    public function __construct($plus, $graphBuilder) {
        $this->plus = $plus;
        if(is_string($graphBuilder))
            $graphBuilder = new $graphBuilder();
        $this->builder = $graphBuilder;
    }

    public function getGraph($params) {
        $plus = $this->plus;

        $pids = explode(';', $params['pids']);

        $data = array();

        if(!isset($params['maxResults']) || $params['maxResults'] < 1)
            $params['maxResults'] = 20;

        foreach($pids as $pid) {
            try {
                $acts = $plus->getActivities($pid, $params['maxResults']);

                if(!isset($acts) || !isset($acts["items"]))
                    continue;

                foreach($acts["items"] as $act) {
                    if($act['verb'] == 'share') {
                        $share = array(
                            'actor' => $act['object']['actor']
                        );
                    }

                    if(isset($act['object'])) {
                        if($act['object']['replies']['totalItems'] > 0 && $params['maxComments'] > 0) {
                            try {
                                $coms = $plus->getListComments($act['id'], $params['maxComments']);
                            }
                            catch (Exception $e){
                                Yii::log(json_encode($e), "error");
                            }
                        }

                        if($act['object']['plusoners']['totalItems'] > 0 && $params['maxPlusoners'] > 0) {
                            try {
                                $pluss = $plus->getPersonsByActivity($act['id'], 'plusoners', $params['maxPlusoners']);
                            }
                            catch (Exception $e){
                                Yii::log(json_encode($e), "error");
                            }
                        }

                        if($act['object']['resharers']['totalItems'] > 0 && $params['maxResharers'] > 0) {
                            try {
                                $repost = $plus->getPersonsByActivity($act['id'], 'resharers', $params['maxResharers']);
                            }
                            catch (Exception $e){
                                Yii::log(json_encode($e), "error");
                            }
                        }
                    }

                    $data[] = array(
                        'post' => $act,
                        'share' => $share,
                        'comments' => $coms,
                        'plus' => $pluss,
                        'repost' => $repost,
                    );
                }
            }
            catch(Exception $e) {
                Yii::log(json_encode($e), "error");
            }
        }

        $opt = array(
            'maxEdge' => $this->maxEdge,
        );

        try {
            $nodes = $this->builder->build($data, &$opt);
            $this->maxEdge = $opt['maxEdge'];
            $this->paintNode($nodes);
        }
        catch(Exception $e) {
            $nodes = array("error" => json_encode($e));
            Yii::log(json_encode($e), "error");
        }
        return $nodes;
    }

    public $gradient = array(
        'FFFF78',
        'FDFF34',
        'FF7F50',
        'FF8734',
        'FF3834',
    );

    public function paintNode($nodes) {
        $grad = $this->MultiColorFade($this->gradient, $this->maxEdge+1);
        //$step = $this->maxEdge / 5;
        foreach($nodes as $node) {
            $node->data['$color'] = '#'.$grad[$node->data['$dim']];

            /*$count = $node->data['$dim'];
            if($count <= $step) {
                $node->data['$color'] = $this->gradient[0];
            }
            elseif($count <= $step * 2) {
                $node->data['$color'] = $this->gradient[1];
            }
            elseif($count <= $step * 3) {
                $node->data['$color'] = $this->gradient[2];
            }
            elseif($count <= $step * 4) {
                $node->data['$color'] = $this->gradient[3];
            }
            else {
                $node->data['$color'] = $this->gradient[4];
            }
            //$node->data['$dim'] = count($node->adjacencies);*/
            foreach($node->adjacencies as $edge) {
                $edge->data['$color'] = $node->data['$color'];
            }
        }
    }

    function MultiColorFade($hex_array, $steps) {
        $tot = count($hex_array);
        $gradient = array();
        $fixend = 2;
        $passages = $tot-1;
        $stepsforpassage = floor($steps/$passages);
        $stepsremain = $steps - ($stepsforpassage*$passages);

        for($pointer = 0; $pointer < $tot-1 ; $pointer++) {
            $hexstart = $hex_array[$pointer];
            $hexend = $hex_array[$pointer + 1];

            if($stepsremain > 0){
                if($stepsremain--){
                    $stepsforthis = $stepsforpassage + 1;
                }
            }
            else{
               $stepsforthis = $stepsforpassage;
            }

            if($pointer > 0){
                $fixend = 1;
            }

            $start['r'] = hexdec(substr($hexstart, 0, 2));
            $start['g'] = hexdec(substr($hexstart, 2, 2));
            $start['b'] = hexdec(substr($hexstart, 4, 2));

            $end['r'] = hexdec(substr($hexend, 0, 2));
            $end['g'] = hexdec(substr($hexend, 2, 2));
            $end['b'] = hexdec(substr($hexend, 4, 2));

            $step['r'] = ($start['r'] - $end['r']) / ($stepsforthis);
            $step['g'] = ($start['g'] - $end['g']) / ($stepsforthis);
            $step['b'] = ($start['b'] - $end['b']) / ($stepsforthis);

            for($i = 0; $i <= $stepsforthis-$fixend; $i++) {
                $rgb['r'] = floor($start['r'] - ($step['r'] * $i));
                $rgb['g'] = floor($start['g'] - ($step['g'] * $i));
                $rgb['b'] = floor($start['b'] - ($step['b'] * $i));

                $hex['r'] = sprintf('%02x', ($rgb['r']));
                $hex['g'] = sprintf('%02x', ($rgb['g']));
                $hex['b'] = sprintf('%02x', ($rgb['b']));

                $gradient[] = strtoupper(implode(NULL, $hex));
            }
        }

        $gradient[] = $hex_array[$tot-1];
        return $gradient;
    }
}
