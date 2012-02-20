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

    private $users = array();
    private $data = array();

    public function getGraph($params) {
        $plus = $this->plus;

        $pids = explode(';', $params['pids']);

        if(!isset($params['maxResults']) || $params['maxResults'] < 1)
            $params['maxResults'] = 20;

        if(!isset($params['depth']))
            $params['depth'] = 0;

        $this->users = array();
        $this->data = array();

        foreach($pids as $pid) {
            $this->generate($plus, $pid, $params, $params['depth']);
        }

        $opt = array(
            'maxEdge' => $this->maxEdge,
        );

        try {
            $nodes = $this->builder->build($this->data, &$opt);
            $this->maxEdge = $opt['maxEdge'];
            $this->paintNode($nodes);
        }
        catch(Exception $e) {
            $nodes = array("error" => json_encode($e));
            Yii::log(json_encode($e), "error");
        }
        return $nodes;
    }

    private function generate($plus, $pid, $params, $depth = 0) {
        Yii::log("BEGIN_GENERATE = " . $pid . "depth = " . $depth, "error");
        try {
            $data = &$this->data;
            if(isset($this->users[$pid]))
                return;
            $this->users[$pid] = true;
            Yii::log("getting feed", "error");
            $acts = $plus->getActivities($pid, $params['maxResults']);

            if(!isset($acts) || !isset($acts["items"]))
                return;

            foreach($acts["items"] as $act) {

                Yii::log("unset values", "error");
                unset($share);
                unset($coms);
                unset($pluss);
                unset($repost);

                if($act['verb'] == 'share') {
                    Yii::log("have share", "error");
                    $share = array(
                        'actor' => $act['object']['actor']
                    );
                }

                if(isset($act['object'])) {
                    if($act['object']['replies']['totalItems'] > 0 && $params['maxComments'] > 0) {
                        Yii::log("have comment", "error");
                        try {
                            $coms = $plus->getListComments($act['id'], $params['maxComments']);
                        }
                        catch (Exception $e){
                            Yii::log(json_encode($e), "error");
                        }
                    }

                    if($act['object']['plusoners']['totalItems'] > 0 && $params['maxPlusoners'] > 0) {
                        Yii::log("have plus", "error");
                        try {
                            $pluss = $plus->getPersonsByActivity($act['id'], 'plusoners', $params['maxPlusoners']);
                        }
                        catch (Exception $e){
                            Yii::log(json_encode($e), "error");
                        }
                    }

                    if($act['object']['resharers']['totalItems'] > 0 && $params['maxResharers'] > 0) {
                        Yii::log("have reshare", "error");
                        try {
                            $repost = $plus->getPersonsByActivity($act['id'], 'resharers', $params['maxResharers']);
                        }
                        catch (Exception $e){
                            Yii::log(json_encode($e), "error");
                        }
                    }
                }

                $cur = array(
                    'post' => $act,
                    'share' => $share,
                    'comments' => $coms,
                    'plus' => $pluss,
                    'repost' => $repost,
                );
                $data[] = $cur;

                if ($depth > 0) {
                    Yii::log("depth = " . $depth, "error");
                    if(isset($share)) {
                        try {
                            $this->generate($plus, $share['actor']['id'], $params, $depth - 1);
                        }
                        catch(Exception $e) {
                            Yii::log(json_encode($e), "error");
                        }
                    }

                    if(isset($coms) && isset($coms["items"])) {
                        foreach($coms["items"] as $com) {
                            try {
                                $this->generate($plus, $com['actor']['id'], $params, $depth - 1);
                            }
                            catch(Exception $e) {
                                Yii::log(json_encode($e), "error");
                            }
                        }
                    }

                    $coms = $pluss;
                    if(isset($coms) && isset($coms["items"])) {
                        foreach($coms["items"] as $com) {
                            try {
                                $this->generate($plus, $com['id'], $params, $depth - 1);
                            }
                            catch(Exception $e) {
                                Yii::log(json_encode($e), "error");
                            }
                        }
                    }

                    $coms = $repost;
                    if(isset($coms) && isset($coms["items"])) {
                        foreach($coms["items"] as $com) {
                            try {
                                $this->generate($plus, $com['id'], $params, $depth - 1);
                            }
                            catch(Exception $e) {
                                Yii::log(json_encode($e), "error");
                            }
                        }
                    }
                }
            }
        }
        catch(Exception $e) {
            Yii::log(json_encode($e), "error");
        }
        Yii::log("END_GENERATE = " . $pid, "error");
    }

    public $gradient = array(
        'FFFF78',
        'FDFF34',
        'FFB050',
        'FF7F50',
        'FF8734',
        'FF3834',
    );

    public function paintNode($nodes) {
        $arr = array();
        $i = 0;
        foreach($nodes as $node) {
            $d = $node->data['$dim'];
            if(!isset($arr[$d]))
                $arr[$d] = $i++;
        }
        ksort($arr);
        $i = 0;
        foreach($arr as $a => $v){
            $arr[$a] = $i++;
        }

        $this->maxEdge = count($arr);

        $grad = $this->MultiColorFade($this->gradient, $this->maxEdge);
        Yii::log(json_encode($arr) . "|" . json_encode($grad), "error");
        foreach($nodes as $node) {
            $d = $node->data['$dim'];
                $node->data['$color'] = '#'.$grad[$arr[$d]];
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

            if(!$stepsforthis)
                $stepsforthis = 1;

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
