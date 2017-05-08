var __connected_ft = (function(){

	'use strict';

	var isPushEnabled = false;

	var appSubscription = undefined;

	var deviceID = localStorage.getItem('device_id') || Math.random() * 1000000 | 0;
	localStorage.setItem('device_id', deviceID);

	var existingCards = JSON.parse( localStorage.getItem('cards') ) || [];

	var elements = {
		subscribeForm : document.querySelector('form#registerDevice'),
		triggerBtn : document.querySelector('button.triggerBtn'),
		stream : document.querySelector('.stream'),
		titleBar : document.querySelector('header')
	};
	
	function zeroPad(n){

		if(n < 10){
			return '0' + n;
		} else {
			return n;
		}

	}

	function createCard(data, animate){

		if(animate === undefined || animate === null){
			animate = true;
		}

		var time = new Date();

		var docFrag = document.createDocumentFragment();
		
		var itemContainer = document.createElement('div');
		var timeReceieved = document.createElement('span');
		var contentContainer = document.createElement('div');

		itemContainer.classList.add('streamitem');
		timeReceieved.classList.add('timeReceived');
		contentContainer.classList.add('content');

		if(animate){
			itemContainer.dataset.collapsed = "true";
		}

		timeReceieved.textContent = zeroPad( time.getHours() ) + ":" + zeroPad( time.getMinutes() );
		itemContainer.appendChild(timeReceieved);

		var headline = document.createElement('strong');
		var byline = document.createElement('span');
		var image = document.createElement('img');
		var link = document.createElement('a');

		headline.textContent = data.headline;
		byline.textContent = data.byline;
		image.src = data.imagesrc;
		link.href = data.url;
		link.target = '_blank';
		link.textContent = 'Read now';

		contentContainer.appendChild(headline);
		contentContainer.appendChild(byline);
		
		if(data.imagesrc !== undefined){
			contentContainer.appendChild(image);
		}

		contentContainer.appendChild(link);
		itemContainer.appendChild(contentContainer);

		docFrag.appendChild(itemContainer);

		return docFrag;

	}

	function registerDevice(subscription, name){

		subscription = subscription || appSubscription;

		return fetch('/devices/register', {
				method : 'POST',
				headers : {
					'Content-Type' : 'application/json'
				},
				credentials : 'include',
				body : JSON.stringify({
					id : deviceID,
					subscription : subscription,
					name : name
				})
			})
			.then(res => {
				if(!res.ok){
					throw res
				} else {
					return res.json();
				}
			})
			.catch(err => {
				console.log('Registration error', err);
			})
		;

	}

	function subscribe(name) {

		navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) { 

			serviceWorkerRegistration.pushManager.subscribe({userVisibleOnly: true})
				.then(function(subscription) {
					// The subscription was successful
					isPushEnabled = true;
					appSubscription = subscription;
					elements.subscribeForm.dataset.visible = false;
					
					console.log(subscription);
					
					registerDevice(subscription, name)
						.then(function(response){
							console.log('Subscription response', response);
						})
					;
					
				})
				.catch(function(e) {
					if (Notification.permission === 'denied') {
						// The user denied the notification permission which
						// means we failed to subscribe and the user will need
						// to manually change the notification permission to
						// subscribe to push messages
						console.log('Permission for Notifications was denied');
						elements.subscribeForm.dataset.visible = true;
					} else {
						// A problem occurred with the subscription, this can
						// often be down to an issue or lack of the gcm_sender_id
						// and / or gcm_user_visible_only
						console.log('Unable to subscribe to push.', e);
						elements.subscribeForm.dataset.visible = true;
						
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
					elements.subscribeForm.dataset.visible = 'true';
					localStorage.clear();
					deviceID = localStorage.getItem('device_id') || Math.random() * 1000000 | 0;
					localStorage.setItem('device_id', deviceID);
					window.location.reload();
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

	function addCard(data, animate){

		if(animate === undefined || animate === null){
			animate = true;
		}

		var newCard = createCard(data, animate);

		elements.stream.insertBefore(newCard, elements.stream.querySelectorAll('.streamitem')[0]);

		existingCards.push(data);

		localStorage.setItem('cards', JSON.stringify(existingCards));

		if(animate){

			setTimeout(function(){
				document.querySelectorAll('.streamitem')[0].dataset.collapsed = 'false';
			}, 50);

		}

	}

	function bindEvents(){

		elements.subscribeForm.addEventListener('submit', function(e){
			e.preventDefault();
			subscribe(this[0].value);
		}, false);

		window.addEventListener('keyup', function(e){
			console.log(e);
			if(e.keyCode === 27){
				console.log('ESC pressed. Unsubscribing');
				unsubscribe();
			}
		});

		elements.titleBar.addEventListener('click', function(){

			unsubscribe();

		}, false);

		navigator.serviceWorker.addEventListener('message', function(event){
			console.log("Client 1 Received Message: " + event.data);

			/*var newCard = createCard({
				headline : 'Euro and French stocks surge on expectation Macron beats Le Pen',
				byline : "Centrist’s likely success in head-to-head for French presidency eases investor nerves",
				imagesrc : "https://www.ft.com/__origami/service/image/v2/images/raw/http%3A%2F%2Fprod-upp-image-read.ft.com%2F5d033616-2856-11e7-bc4b-5528796fe35c?source=next&fit=scale-down&compression=best&width=750",
				url : 'https://www.ft.com/content/14b558da-284c-11e7-bc4b-5528796fe35c'
			});*/

			var data = JSON.parse(event.data);

			addCard(data);

		});

	}

	function initialise(){

		bindEvents();

		existingCards.forEach(function(card, idx){

			if(idx < 10){
				addCard(card, false);
			}

		});

		navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) { 

			serviceWorkerRegistration.pushManager.getSubscription()
				.then(function(pushSubscription){
					
					console.log(pushSubscription);

					if(!pushSubscription){
						console.log("We're not subscribed to push notifications");
						isPushEnabled = false;
						elements.subscribeForm.dataset.visible = 'true';
					} else {
						console.log("We're subscribed for push notifications");
						isPushEnabled = true;
						// elements.triggerBtn.dataset.visible = 'true';
						elements.subscribeForm.dataset.visible = 'false';
						appSubscription = pushSubscription;
					}

				})
			;
			
		});

	}

	return {
		init : initialise
	};

}());


