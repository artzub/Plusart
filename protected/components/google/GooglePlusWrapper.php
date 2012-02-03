<?php
/**
 * @author: ArtZub <artzub@gmail.com>
 */
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
}
