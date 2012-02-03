<?php
/**
 * @author: ArtZub <artzub@gmail.com>
 */
interface IGoogleApiWrapper {

    public function getApiName();

    public function getPool();

    public function setPool($pool);

    public function init($pool, $option=array());
}
