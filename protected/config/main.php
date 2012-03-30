<?php

// uncomment the following to define a path alias
// Yii::setPathOfAlias('local','path/to/local-folder');

Yii::setPathOfAlias('gapi',dirname(__FILE__).DIRECTORY_SEPARATOR.'../vendors/gapi/src');

// This is the main Web application configuration. Any writable
// CWebApplication properties can be configured here.

return array(
	'basePath'=>dirname(__FILE__).DIRECTORY_SEPARATOR.'..',
	'name'=>'Google Plus Visualizations',

	// preloading 'log' component
	'preload'=>array('log'),

	// autoloading model and component classes
	'import'=>array(
		'application.models.*',
		'application.components.*',

        //gapi
        'gapi.*',
        'application.components.google.*',
        'application.components.graph.*',
	),

	'modules'=>array(
		// uncomment the following to enable the Gii tool

		'gii'=>array(
			'class'=>'system.gii.GiiModule',
			'password'=>'mySuperPass',
		 	// If removed, Gii defaults to localhost only. Edit carefully to taste.
			'ipFilters'=>array('127.0.0.1','::1'),
		),
	),

	// application components
	'components'=>array(
        'cache'=>array(
            'class'=>'system.caching.CMemCache',
            //'useMemcached' => true,
        ),

        'gapis' => array(
            'class' => 'GoogleApis',
            'apis' => array(
                'plus' => array(
                    'class' => 'GooglePlusWrapper',
                ),
            ),
            'apiConfig' => array(
                'oauth2_client_id' => '733153716518.apps.googleusercontent.com',
                'oauth2_client_secret' => 'StVK3rCxaMb5jBmRQcnnLDnN',
                'oauth2_redirect_uri' => 'http://localhost/login',
                'developer_key' => 'AIzaSyAsyXRlUEgHZC4RNwQ7YrsVonWVEhB-FpY',
            ),
        ),
		'user'=>array(
			// enable cookie-based authentication
			'allowAutoLogin'=>true,
		),
		// uncomment the following to enable URLs in path-format

		'urlManager'=>array(
            'urlFormat'=>'path',
            'showScriptName'=>false,
            'appendParams' => false,
			'rules'=>array(
                '<action:\w+>'=>'site/<action>',
			),
		),
		/*'db'=>array(
			'connectionString' => 'sqlite:'.dirname(__FILE__).'/../data/testdrive.db',
		),
		// uncomment the following to use a MySQL database
		/*
		'db'=>array(
			'connectionString' => 'mysql:host=localhost;dbname=testdrive',
			'emulatePrepare' => true,
			'username' => 'root',
			'password' => '',
			'charset' => 'utf8',
		),
		*/
		'errorHandler'=>array(
			// use 'site/error' action to display errors
            'errorAction'=>'site/error',
        ),
		'log'=>array(
			'class'=>'CLogRouter',
			'routes'=>array(
				array(
					'class'=>'CFileLogRoute',
					'levels'=>'trace, info',
				),
                array(
                    'class'=>'CEmailLogRoute',
                    'levels'=>'error, warning',
                    'emails'=>'artzub@gmail.com',
                ),
				// uncomment the following to show log messages on web pages

				array(
					'class'=>'CWebLogRoute',
				),

			),
		),
	),

	// application-level parameters that can be accessed
	// using Yii::app()->params['paramName']
	'params'=>array(
		// this is used in contact page
		'adminEmail'=>'artzub@gmail.com',
	),
);