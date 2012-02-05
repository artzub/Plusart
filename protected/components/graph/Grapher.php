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

        foreach($pids as $pid) {
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
                    if($act['object']['replies']['totalItems'] > 0) {
                        try {
                            $coms = $plus->getListComments($act['id'], $params['maxComments']);
                        }
                        catch (Exception $e){
                        }
                    }

                    if($act['object']['plusoners']['totalItems'] > 0) {
                        try {
                            $pluss = $plus->getPersonsByActivity($act['id'], 'plusoners', $params['maxPlusoners']);
                        }
                        catch (Exception $e){
                        }
                    }

                    if($act['object']['resharers']['totalItems'] > 0) {
                        try {
                            $repost = $plus->getPersonsByActivity($act['id'], 'resharers', $params['maxResharers']);
                        }
                        catch (Exception $e){
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

        return $this->builder->build($data);
    }
}
