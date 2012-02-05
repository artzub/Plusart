<?php
/**
 * @author: ArtZub <artzub@gmail.com>
 */

require_once "IGoogleApiWrapper.php";

class GooglePlusWrapper implements IGoogleApiWrapper {

    /**
     * @var (@link apiPlusService)
     */
    protected $plus;

    /**
     * @var name api that wraps
     */
    private $name = "Plus";

    /**
     * @var GoogleApis the {@link GoogleApis} application component.
     */
    private $pool;

    public function init($pool, $option=array()) {
        Yii::import('gapi.contrib.apiPlusService');
        if(isset($pool)) {
            $this->setPool($pool);
            $this->plus = new apiPlusService($pool->getClient());
        }
        else {
            throw new CException("CoogleApis.client not initialized");
        }
    }

    public function getApiName() {
        return $this->name;
    }

    public function getPool() {
        return $this->pool;
    }

    public function setPool($pool) {
        $this->pool = $pool;
    }

    public function getPerson($pid='me') {
        if ($this->pool->IsAuth()) {
            $person = $this->plus->people->get($pid);
            $this->pool->refreshToken();
        }
        return $person;
    }

    public function getPersonsByActivity($aid, $collection, $maxResults = 100, $pageToken = null) {
        if ($this->pool->IsAuth()) {
            $params = array(
                'maxResults' => $maxResults,
                'pageToken' => $pageToken,
            );
            $persons = $this->plus->people->listByActivity($aid, $collection, $params);
            $this->pool->refreshToken();
        }
        return $persons;
    }

    public function getActivities($pid="me", $maxResults = 100, $pageToken = null) {
        if ($this->pool->IsAuth()) {
            $params = array(
                'maxResults' => $maxResults,
                'pageToken' => $pageToken,
            );
            $activities = $this->plus->activities->listActivities($pid, 'public', $params);
            $this->pool->refreshToken();
        }
        return $activities;
    }

    public function getActivity($aid) {
        if ($this->pool->IsAuth()) {
            $activity = $this->plus->activities->getActivity($aid);
            $this->pool->refreshToken();
        }
        return $activity;
    }

    public function getListComments($aid, $maxResults = 100, $pageToken = null) {
        if ($this->pool->IsAuth()) {
            $params = array(
                'maxResults' => $maxResults,
                'pageToken' => $pageToken,
            );
            $comments = $this->plus->comments->listComments($aid, $params);
            $this->pool->refreshToken();
        }
        return $comments;
    }
}
