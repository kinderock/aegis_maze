var Auth = {


	init: function() {
		 window.fbAsyncInit = Auth.initFacebook();
	},


	initFacebook: function() {
		FB.init({
			appId      : '1230953973697306',
			cookie     : true,
			xfbml      : true,
			version    : 'v2.8'
		});
		FB.AppEvents.logPageView();
	},


	fbLogin: function(button) {
		FB.login((response) => {
			console.log('response',response);
		}, {scope: 'public_profile, email'});
	}
};

document.addEventListener("DOMContentLoaded", function(){
	Auth.init();
});

// https://developers.facebook.com/docs/facebook-login/web#logindialog
// https://developers.facebook.com/docs/facebook-login/permissions
// https://developers.facebook.com/apps/1230953973697306/fb-login/quickstart/
