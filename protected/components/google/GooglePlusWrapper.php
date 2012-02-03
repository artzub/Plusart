<?php
/**
 * @author: ArtZub <artzub@gmail.com>
 */
class GooglePlusWrapper extends CApplicationComponent implements IGoogleApiWrapper {

    /**
     * @var (@link apiPlusService)
     */
    protected $plus;

    /**
     * @var name api that wraps
     */
    private $name = "Plus";

    /**
     * @var GoogleA the {@link EAuth} application component.
     */
    private $pool;

    public function init($pool, $option=array()) {
        Yii::import('gapi.contrib.apiPlusService');
        $this->setPool($pool);
        $this->plus = new apiPlusService($pool->client);
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
}
