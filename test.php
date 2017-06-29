<?php
	// $fb = new Facebook\Facebook([
	// 	'app_id' => '{app-id}', // Replace {app-id} with your app id
	// 	'app_secret' => '{app-secret}',
	// 	'default_graph_version' => 'v2.2',
	// 	]);
	//
	// echo "<pre>";
	// var_dump($fb);
	// echo "</pre>";
	//
	// $helper = $fb->getRedirectLoginHelper();
	//
	// $permissions = ['email']; // Optional permissions
	// $loginUrl = $helper->getLoginUrl('https://example.com/fb-callback.php', $permissions);
	//
	// echo '<a href="aa">Log in with Facebook!</a>';
?>

<a href="#" onclick="Auth.fbLogin(this);return false;">Log in with Facebook!</a>

<script src="//connect.facebook.net/en_US/sdk.js" charset="utf-8"></script>
<script src="/js/auth.js" charset="utf-8"></script>
