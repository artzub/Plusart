<?php
/**
 * Created by JetBrains PhpStorm.
 * User: Admin
 * Date: 23.03.12
 * Time: 3:41
 * To change this template use File | Settings | File Templates.
 */
class gapiOAuth2Refresh extends CWidget
{
    public function run() {

        Yii::app()->clientScript->registerScript("refauth", "
            var accessToken = " . Yii::app()->gapis->getTokenForJS() . "

            var ref_expires_in = accessToken.expires_in;
            var ref_downid = setInterval(ref_countDownExp, 1000);
            var autoreftoken = true;

            function ref_countDownExp() {
                if (ref_downid != null && ref_expires_in-- <= 29) {
                    window.clearInterval(ref_downid);
                    if (autoreftoken)
                        refreshAccessToken();
                }
            }

            function clearCountDown() {
                window.clearInterval(ref_downid);
            }

            function setCountDown() {
                clearCountDown();
                ref_downid =
                    setInterval(ref_countDownExp, 1000);
            }

            function refreshAccessToken(){
                $.ajax({
                    type: 'POST',
                    contentType: 'application/json',
                    url: 'refreshAccessToken',
                    success: function(data) {
                        if ((parseInt(data.Response['Status-Code']) >= 200) &&
                            (parseInt(data.Response['Status-Code']) < 300)) {
                            accessToken.access_token = data.access_token;
                            accessToken.expires_in = data.expires_in;
                            gapi.auth.setToken(accessToken);
                            ref_expires_in = accessToken.expires_in;

                            setCountDown();
                            ref_countDownExp();
                        }
                    },
                    error: function(jqXHR, data) {
                    },
                    dataType: 'json',
                    data: JSON.stringify(accessToken)
                });
            }
        ", CClientScript::POS_HEAD);
    }
}
