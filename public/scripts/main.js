var __connected_ft = (function(){

	'use strict';

	var API_KEY = 'AAAARkLBNBk:APA91bG-5SRR12484VbE3rNlR1Xr2N0OunZNhq9YFpn38s_8mpXnqpCoTUc9MqF_qgrFitrc-pQox8pMb4C6RPprEp2KiAH7L3ET2los9em7n-6-hgAbjUOtpqudkrSvfzDFtw3tmJZh';
	var GCM_ENDPOINT = 'https://android.googleapis.com/gcm/send';

	var isPushEnabled = false;

	var elements = {
		subscribeBtn : document.querySelector('button.subscribeBtn')
	};

	function showCurlCommand(mergedEndpoint) {
		// The curl command to trigger a push message straight from GCM
		if (mergedEndpoint.indexOf(GCM_ENDPOINT) !== 0) {
			window.Demo.debug.log('This browser isn\'t currently ' +
				'supported for this demo');
			return;
		}

		var endpointSections = mergedEndpoint.split('/');
		var subscriptionId = endpointSections[endpointSections.length - 1];

		var curlCommand = 'curl --header "Authorization: key=' + API_KEY +
			'" --header Content-Type:"application/json" ' + GCM_ENDPOINT +
			' -d "{\\"registration_ids\\":[\\"' + subscriptionId + '\\"]}"';

		console.log(curlCommand);
	}

	function triggerNotification(sub){

		fetch('/trigger', {
				method : 'POST',
				headers : {
					'Content-Type' : 'application/json'
				},
				body : JSON.stringify(sub)
			})
			.then(res => res.json())
			.then(d => console.log(d));

	}

	function subscribe() {

		navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) { 

			serviceWorkerRegistration.pushManager.subscribe({userVisibleOnly: true})
				.then(function(subscription) {
					// The subscription was successful
					isPushEnabled = true;

					console.log(subscription);

					showCurlCommand(subscription.endpoint);

					triggerNotification(subscription);

					// TODO: Send the subscription subscription.endpoint
					// to your server and save it to send a push message
					// at a later date
					// return sendSubscriptionToServer(subscription);
				})
				.catch(function(e) {
					if (Notification.permission === 'denied') {
						// The user denied the notification permission which
						// means we failed to subscribe and the user will need
						// to manually change the notification permission to
						// subscribe to push messages
						console.log('Permission for Notifications was denied');
						elements.subscribeBtn.disabled = true;
					} else {
						// A problem occurred with the subscription, this can
						// often be down to an issue or lack of the gcm_sender_id
						// and / or gcm_user_visible_only
						console.log('Unable to subscribe to push.', e);
						elements.subscribeBtn.disabled = false;
					}
				})
			;

		});

	}

	function bindEvents(){

		elements.subscribeBtn.addEventListener('click', function(){

			subscribe();

		}, false);

	}

	function initialise(){

		bindEvents();

		navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) { 

			serviceWorkerRegistration.pushManager.getSubscription()
				.then(function(pushSubscription){
					
					console.log(pushSubscription);

					if(!pushSubscription){
						console.log("We're not subscribed to push notifications");
						isPushEnabled = false;
					} else {
						console.log("We're subscribed for push notifications");
						isPushEnabled = true;						
					}

				})
			;
			
		});

	}

	return {
		init : initialise
	};

}());


