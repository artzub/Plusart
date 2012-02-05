<?php
/**
 * User: Admin
 * Date: 04.02.12
 * Time: 2:14
 */
class RunForm extends CFormModel
{
    public $pids = 'me';
    public $maxResults = 20;
    public $maxComments = 20;
    public $maxPlusoners = 20;
    public $maxResharers = 20;
    public $depth = 0;
    public $verifyCode;

    public function rules() {
        return array(
            array('verifyCode', 'captcha', 'allowEmpty'=>!CCaptcha::checkRequirements()),
        );
    }

    public function attributeLabels() {
        return array(
            'verifyCode'=>'Verification Code',
        );
    }
}
