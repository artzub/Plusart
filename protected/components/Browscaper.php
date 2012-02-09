<?php
/**
 * Browscaper class file.
 *
 * @author Jon Doe <artzub@gmail.com>
 */

/**
 * Browscaper is ...
 *
 *
 * @author Jon Doe <artzub@gmail.com>
 * @version 0.1
 * @package
 * @since 1.0
 */

include_once('Browscap.php');

class Browscaper extends CComponent
{
    public static function getBrowser(){
        self::log('get browser', 'trace');
        return self::get_Browser()->Browser;
    }

    public static function get_Browser($user_agent = null, $return_array = false){
        self::log('create Browscap', 'trace');
        $bc = new Browscap('../runtime');
        self::log('create Browser', 'trace');
        return $bc->getBrowser($user_agent, $return_array);
    }

    /**
     * Logs a message.
     *
     * @param string $message Message to be logged
     * @param string $level Level of the message (e.g. 'trace', 'warning',
     * 'error', 'info', see CLogger constants definitions)
     */
    public static function log($message, $level='error')
    {
        Yii::log($message, $level, __CLASS__);
    }

    /**
     * Dumps a variable or the object itself in terms of a string.
     *
     * @param mixed variable to be dumped
     */
    protected function dump($var='dump-the-object',$highlight=true)
    {
        if ($var === 'dump-the-object') {
            return CVarDumper::dumpAsString($this,$depth=15,$highlight);
        } else {
            return CVarDumper::dumpAsString($var,$depth=15,$highlight);
        }
    }
}
