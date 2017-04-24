var __connected_ft = (function(){

	'use strict';

	var API_KEY = 'AAAARkLBNBk:APA91bG-5SRR12484VbE3rNlR1Xr2N0OunZNhq9YFpn38s_8mpXnqpCoTUc9MqF_qgrFitrc-pQox8pMb4C6RPprEp2KiAH7L3ET2los9em7n-6-hgAbjUOtpqudkrSvfzDFtw3tmJZh';
	var GCM_ENDPOINT = 'https://android.googleapis.com/gcm/send';

	var isPushEnabled = false;

	var appSubscription = undefined;

	var deviceID = localStorage.getItem('device_id') || Math.random() * 1000000 | 0;
	localStorage.setItem('device_id', deviceID);

	var elements = {
		subscribeBtn : document.querySelector('button.subscribeBtn'),
		triggerBtn : document.querySelector('button.triggerBtn'),
		deviceID : document.querySelector('.deviceID')
	};

	function registerDevice(subscription){

		subscription = subscription || appSubscription;

		fetch('/notifications/register', {
				method : 'POST',
				headers : {
					'Content-Type' : 'application/json'
				},
				body : JSON.stringify({
					id : deviceID,
					subscription : subscription
				})
			})
			.then(res => {
				if(!res.ok){
					throw res
				}
			})
			.catch(err => {
				console.log('Registration error', err);
			})
		;

	}

	function subscribe() {

		navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) { 

			serviceWorkerRegistration.pushManager.subscribe({userVisibleOnly: true})
				.then(function(subscription) {
					// The subscription was successful
					isPushEnabled = true;
					appSubscription = subscription;

					console.log(subscription);

					// triggerNotification(subscription);
					elements.subscribeBtn.dataset.visible = 'false';
					
					registerDevice(subscription);
					elements.deviceID.textContent = deviceID;
					
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

	function unsubscribe() {

		navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
			// To unsubscribe from push messaging, you need get the
			// subcription object, which you can call unsubscribe() on.
			serviceWorkerRegistration.pushManager.getSubscription().then(
			function(pushSubscription) {
				// We have a subcription, so call unsubscribe on it
				pushSubscription.unsubscribe()
				.then(function() {
					console.log('Unsubscribed');
					elements.subscribeBtn.dataset.visible = 'true';
					localStorage.clear();
					elements.deviceID.textContent = '';
				})
				.catch(function(e) {
					console.log('Unsubscription error: ', e);
				});
			})
			.catch(function(e) {
				console.log('Error thrown while unsubscribing from ' +
				'push messaging.', e);
			});
		});
	}

	function bindEvents(){

		elements.subscribeBtn.addEventListener('click', function(){
			subscribe();
		}, false);

		window.addEventListener('keyup', function(e){
			console.log(e);
			if(e.keyCode === 27){
				console.log('ESC pressed. Unsubscribing');
				unsubscribe();
			}
		});

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
						elements.subscribeBtn.dataset.visible = 'true';
					} else {
						console.log("We're subscribed for push notifications");
						isPushEnabled = true;
						// elements.triggerBtn.dataset.visible = 'true';
						appSubscription = pushSubscription;
						elements.deviceID.textContent = deviceID;
					}

				})
			;
			
		});

	}

	return {
		init : initialise
	};

}());


