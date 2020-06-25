function gameInit(){

  //Logout 
  const logOutModal = document.querySelector("#signout-modal");
  const logOutBtn = document.querySelector("#signOutBtn");
  const logoutTrigger = document.querySelector("#logout-modal-trigger");

  //Open target modal
  const scannerModal = document.querySelector('#scanner-container');
  const scannerContent = document.querySelector('#scanner-content');
  const openTargetForm = document.querySelector('#openTargetForm');
  const openTargetId = document.querySelector('#openTargetId');
  const code = openTargetForm['code'];
  
  //Infomodal
  const infoModal = document.querySelector("#info-container");
  const infoContent = document.querySelector("#info-content");

  //Alertmodal
  const alertModal = document.querySelector("#alert-container");
  const alertContainer = document.querySelector("#alert-content");

  //Open redeem modal
  const redeemCodeForm = document.querySelector('#redeemCode-form');
  const redeemCodeModal = document.querySelector('#redeemCode-container');
  const redeemCodeContent = document.querySelector("#redeemCode-content")
  const redeemCodeBtn = document.querySelector('#redeemCode-modal-trigger');
  const redeemMessage = document.querySelector("#redeemMessage");

  //Message modal
  const messageModal = document.querySelector("#message-modal");
  const messageContent = document.querySelector("#message-content");

  //Info modal
  const legendBtn = document.querySelector("#legend-modal-trigger");
  const legendModal = document.querySelector("#legend-modal");
  const legendContent = document.querySelector("#legend-content");

  //declare variables that will contain all players, and all targets
  let players = [];
  let targets = [];
  let dealersArray = [];

  const teamNameContainer = document.querySelector('#teamName');

  // let userId = "3VAI0nvVQ8NUiNqNXLJJLqnfxaq2";

   //Show game container
   document.querySelector("#container").style.display = "grid";
  
   //Get teamname of signed in user
   db.collection('userInformation').doc(userId).get().then( res => {

     document.querySelector('#teamName').innerHTML = res.data().teamName;
   })

   //Get score, and listen to changes in db
   db.collection('userInformation').doc(userId).onSnapshot( snapshot => {
     document.querySelector('#score').innerHTML = snapshot.data().score;
   })
 
  if(navigator.geolocation){



  //Functions
  //Create message. Takes message to display, and the container where the message is displayed.
  const createMessage = (message, container, element) => {
    let divElement = document.createElement(element);
    divElement.classList.add('error-message');

    let headline = document.createElement(element);
    headline.innerText = message;
    
    divElement.appendChild(headline);

    container.appendChild(divElement);
  }

  //Sign out
  const signOut = () => {
    // location.reload();
    auth.signOut();
  }
  
    

  //Modal functionality
  //Open modal, takes modal id as parameter
  const openModal = (modalId, options) => {
    if(options){
      M.Modal.init(modalId, options);
    } else{
      M.Modal.init(modalId);
    }
    M.Modal.getInstance(modalId).open();
  }
  //Redeem code functionality
  const redeemCode = code => {
    db.collection("redeemCodes").doc(code).get().then( doc => {
      let message;
      if(doc.data().used == false){
        //Close Modal
        M.Modal.init(redeemCodeModal)
        M.Modal.getInstance(redeemCodeModal).close();

        //Open message modal
        openModal(infoModal);
        //Check what the code contains
        if(doc.data().points > 0){
          //Register points
          let points = doc.data().points;
          let increment = firebase.firestore.FieldValue.increment(points);
          db.collection("userInformation").doc(userId).update({score : increment });
          
          //Set code to used 
          db.collection("redeemCodes").doc(code).update({used: true});

          //Create message
          message = "Success! This code earned you " + doc.data().points + " points";
        } else {
          //Create message 
          message = "Sorry... You got ripped off, this code didn't earn you any points";
        }

        //Clear message container div
        document.querySelector("#info-content").innerHTML = "";

        //Create success message
        createMessage(message, infoContent, 'h3');

        console.log("Code valid")
      }else {
        //Create error message
        console.log("NO such code");
        redeemMessage.innerHTML = "";
        createMessage("The code has already been used", redeemMessage, "p");
      }
    })
    .catch( () => {
      console.log("Code does not exist");
      redeemMessage.innerHTML = "";
        createMessage("Invalid redeem code", redeemMessage, "p");
    })
  }

  //Function for locking all targets
  const lockAllTargets = () => {
    db.collection("targets").get().then(querySnapshot => {
      // console.log(querySnapshot);
      querySnapshot.docChanges().forEach(change => {
        console.log(change.doc.id);
        db.collection("targets").doc(change.doc.id).update({locked: true});
      })
    })
  }

  //Open scanner modal, takes target id. 
  const openScannerModal = targetId => {
    //Remove previous messages
    document.querySelectorAll(".error-message").forEach( el => {
      el.remove();
    })
    //Set field value to empty
    code.value = "";
    M.Modal.init(scannerModal)
    M.Modal.getInstance(scannerModal).open();
    openTargetId.value = targetId;

  }

  //Open redeem modal
  const openRedeemModal = () => {
    M.Modal.init(redeemCodeModal);
    M.Modal.getInstance(redeemCodeModal).open();
    redeemCodeForm.redeemCode.value = "";
  }

  //Open logout modal
  const openLogOutModal = () => {
    M.Modal.init(logOutModal);
    M.Modal.getInstance(logOutModal).open();  
  }

  //Open legend modal 
  const openLegendModal = () => {
    M.Modal.init(legendModal)
    M.Modal.getInstance(legendModal).open();
  }

  //Sets target.opened to true in db, returns an object of the targets content
  const openTarget = targetId => {
    db.collection("targets").doc(targetId).update({opened: true})
    .catch( error => {
        console.log("Could not update the document " + targetId + " in targets");
    });

    //Register to userInformation, increment falafelsFound by 1
    db.collection("userInformation").doc(userId).update({falafelsCollected: firebase.firestore.FieldValue.increment(1)});

    //Return its content
    let message;
    db.collection("targets").doc(targetId).get()
    .then( res => {
        //Clear message container div
        document.querySelector("#info-content").innerHTML = "";

        //If the target contains anything
        if(res.data().contains){

          // If contains recipe, register it as found
          if(res.data().contains.recipe){
            let recipe = res.data().contains.recipe;
            db.collection("recipes").doc(recipe).update({found: true});

            // Register the recipe to the user
            db.collection("userInformation").doc(userId)
            .update({recipesFound: firebase.firestore.FieldValue.arrayUnion(recipe)})

            //Show congrats message
            if(recipe == 'falafel'){
              message = "Congratulations! You have just found the legendary falafel recipe!";
            } else{
              message = "Congratulations! You just found one of the missing recipes!";
            }
          }
          //If it contains an artefact
          else if(res.data().contains.artefact){
            message = `Ooh, looks like you found ${res.data().contains.artefact}!`;
            //If it only contains cash
          } 
          else {
            message = "Yay, you found some cash!";
          };
          // Register points
          if(res.data().contains.points){
            let points = res.data().contains.points;
            let increment = firebase.firestore.FieldValue.increment(points);
            db.collection("userInformation").doc(userId).update({score : increment });

            message += `This earns you ${points} points`;
            // console.log(message);
          }

        } else{
          message = "Sorry, this one was empty";
        }
        //Print out information to the user about what was in the container
        openModal(infoModal);

        //Create content to show to the user
        let divElement = document.createElement('div');
        divElement.classList.add('infoModuleHeadline');

        let headline = document.createElement('h4');
        headline.innerText = message;
        console.log(message);

        divElement.appendChild(headline);

        document.querySelector("#info-content").appendChild(divElement);
    })
  }

  const showDealers = () => {
    db.collection("falafelDealers").get().then( dealers => {
      let dealerInfo;
      let marker;
      const dealerIcon = {
        url: 'icons/dealer.png', 
        scaledSize: new google.maps.Size(42, 42.3)
      }
      dealers.forEach( dealer => {
       
        // console.log(dealer.data().location);
        marker = new google.maps.Marker({position: {lat: dealer.data().location._lat, lng: dealer.data().location._long}, icon: dealerIcon, title: "dealer.id"}) 
        dealerInfo = {
          name: dealer.id,
          marker: marker
        };
        marker.setMap(map);
        
        dealersArray.push(dealerInfo);
        
      });
      
      dealersArray.forEach( dealer =>{
        var infowindow = new google.maps.InfoWindow({
          content: dealer.name
        });
        let marker = dealer.marker;
        dealer.marker.addListener('click', function() {
          infowindow.open(map, marker);
        });
      })
    })
  }
  
  
  
  const hideDealers = () => {
    dealersArray.forEach( dealer => {
      dealer.marker.setMap(null);
      console.log("Trying to hide dealers");
    })
  }
  const showBrewdogBar = () => {
    //Show marker for brewdog bar
    let brewdogMarker = new google.maps.Marker({position: {lat: 55.604768, lng: 13.004962}});
    brewdogMarker.setMap(map);
    console.log("Tryin to create a fucking marker!!");
  }
  


  //Event listeners

  //Logout modal
  logoutTrigger.addEventListener('click', openLogOutModal);

  //Logout button
  logOutBtn.addEventListener('click', signOut);

  //Redeem code button
  redeemCodeBtn.addEventListener('click', openRedeemModal); 

  //Handling of redem code form
  redeemCodeForm.addEventListener('submit', e => {
    e.preventDefault();
    //Get user input
    let userInput = redeemCodeForm.redeemCode.value;
    redeemCode(userInput);
  })

  //Legend modal button
  legendBtn.addEventListener('click', openLegendModal);
  

  //Function for sending the openTargetform, and validating the targets Id against its key.
  openTargetForm.openTarget.addEventListener('click', e => {
    e.preventDefault();

    //Get the key from DB and validate
    db.collection("targetKeys").doc(openTargetId.value)
    .get().then( docRef => {
        // console.log(docRef.data().key);
        if(docRef.data().key == code.value){
          console.log("The code was correct!");

          //Close modal
          code.value = "";
          M.Modal.getInstance(scannerModal).close();

          //Set target to 'opened' in db
          openTarget(openTargetId.value);
        }else {
          console.log("Wrong code")
          document.querySelectorAll(".error-message").forEach( el => {
            el.remove();
          })
          //Print out 'Wrong code' message
          let message = "Sorry, you entered the wrong code";
          createMessage(message, scannerContent, "p");
        }
    })
  });

  //Listen for messages
  db.collection("messages").onSnapshot( querySnapshot => {
    messageContent.innerHTML = "";
    querySnapshot.forEach( doc => {
        //Open message modal
        openModal(messageModal);

        //Print out the message
        createMessage(doc.data().heading, messageContent, "h3");
        createMessage(doc.data().body, messageContent, "p");
    })
 
  })

  //Listen for updates in recipies , Stop the game when all have been found!
  db.collection("recipes").onSnapshot( querySnapshot => {
    let notFoundRecipes = [];
    db.collection("recipes").where("found", "==", false).get().then( querySnapshot => {
      querySnapshot.forEach( doc => {
        notFoundRecipes.push(doc.id);
      })
    // console.log(notFoundRecipes);
    //Check if all the recepies have been found or not
    if(notFoundRecipes.length == 0){

      openModal(alertModal);
      alertContainer.innerHTML = "";
      //Create headline
      
      let alert = document.createTextNode("Alert!");
      let h3 = document.createElement('h3');
      h3.appendChild(alert);
      alertContainer.appendChild(h3);

      //Create message 
      alert = document.createTextNode("All the missing recipes have now been found! Make your way to Brewdog Bar as quickly as possible! The first team to make it there will be rewarded");
      let p = document.createElement("p");
      p.appendChild(alert);
      alertContainer.appendChild(p);

      //Stop the game. Lock all the targets
      lockAllTargets();
      
      //Hide falafel dealers
      hideDealers();

      //Hide redeem code button
      redeemCodeBtn.classList.add("disabled");
      redeemCodeBtn.removeEventListener('click', openRedeemModal);

      //Close redeem modules and target modules
      M.Modal.getInstance(scannerModal).close();
      M.Modal.getInstance(redeemCodeModal).close();

      //Show marker for brewdog bar
      showBrewdogBar();
    }  
    })
  })

  //Initialize map
  let map;
  function initMap() {
    let falafelPlace = {lat: 55.602, lng:13.002};
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 55.603, lng: 13},
        zoom: 14,
        disableDefaultUI: true,
        gestureHandling: 'greedy'
    });

    // let targets = [{lat: 55.602, lng:13.002}, {lat: 55.603, lng:13.0002}, {lat: 55.601, lng:13.004}, {lat: 55.6002, lng:13.01}];
    // for(target of targets){
    //     new google.maps.Marker({position: target, icon: 'icons/falafel_icon.png', map: map})
    // }
  }

  //Get all targets and create marker for each on of them
  db.collection("targets").onSnapshot( querySnapshot => {
    let marker;
    let markerId;
    //Loop through each target and place them in the targets array if they have yet to be opened
    querySnapshot.docChanges().forEach(change => {
      // if(change.type === 'added'){
      //   if(change.doc.data().opened == false){
      //     // console.log(change.doc.data())
      //     marker = new google.maps.Marker({position: {lat: change.doc.data().position._lat, lng: change.doc.data().position._long }, icon: 'icons/falafel_icon.png', map: map, id: change.doc.id});
      //     targets.push(marker);
      //     console.log(targets);
      //   }
      // }
      if(change.type === 'modified'){
        if(change.doc.data().opened == true || change.doc.data().locked == true){
          markerId = change.doc.id;
          targets.forEach( (target, index) => {
            if(target.id == markerId){
              target.setMap(null);
              targets[index] = "";
            }
          })
          targets = targets.filter( target => {
            return target.id;
          })
        }
        // console.log(targets);
      } if(change.doc.data().opened == false && change.doc.data().locked == false) {
        const targetIcon = {
          url: 'icons/logo_small_color.png', 
          scaledSize: new google.maps.Size(40, 33)
        }
        
        marker = new google.maps.Marker({position: {lat: change.doc.data().position._lat, lng: change.doc.data().position._long }, icon: targetIcon, map: map, id: change.doc.id});
        targets.push(marker);
        // console.log(targets);
      }
      if(change.type === 'removed'){

      }
    })

    //Add eventlisteners for each target in the targets array
    targets.forEach( target => {
      target.addListener('click', () => {
        // console.log(target.id);
        openScannerModal(target.id);
      })
    })
  })

  //Get my location
  navigator.geolocation.getCurrentPosition( (position) => {
    const myIcon = {
        url: "icons/PlayerPiece-01.png",// url
        scaledSize: new google.maps.Size(25, 40), // scaled size
        // origin: new google.maps.Point(0,0), // origin
        // anchor: new google.maps.Point(0, 0) // anchor
    };

    let myMarker = new google.maps.Marker(
      {position: {lat: position.coords.latitude, lng: position.coords.longitude},
      icon: myIcon, map:map});

    // Save location to database
    db.collection('UserLocations').doc(userId).set({
      location: new firebase.firestore.GeoPoint(position.coords.latitude, position.coords.longitude)
    })

    // Listen to location change
    navigator.geolocation.watchPosition( (position) => {
      myMarker.setPosition({lat: position.coords.latitude, lng: position.coords.longitude})
  
      db.collection('UserLocations').doc(userId).update({
        location: new firebase.firestore.GeoPoint(position.coords.latitude, position.coords.longitude)
      }).then(() => {
        // console.log("Position updated");
      }).catch( (err) => {
        console.log("document could not be updated " + err);
      })
    }, (msg) => {alert('Please enable your GPS position feature.')}, {maximumAge:10000, timeout:50000, enableHighAccuracy: true})
  }, (msg) => {alert('Please enable your GPS position feature.')}, {maximumAge:10000, timeout:50000, enableHighAccuracy: true});

  

      //Get other users locations
    const dealerId = 'lsfL5sQNMHNO7HTj01rDPiNXz563';
    db.collection('UserLocations').get().then( snapshot => {
      const othersIcons = {
          url: "icons/Untitled-1.svg",// url
          scaledSize: new google.maps.Size(30, 40), // scaled size
          // origin: new google.maps.Point(0,0), // origin
          // anchor: new google.maps.Point(0, 0) // anchor
      };
      const dealerIcon = {
        url: 'icons/dealer.png', 
        scaledSize: new google.maps.Size(42, 42.3)
      }
      let marker;
      snapshot.docs.forEach(doc => {
        if(doc.id != userId){
          
          // console.log(doc.id);
          let docData = doc.data();
          let playerPosition = {lat: docData.location._lat, lng: docData.location._long};
          // let mapsPosition = new google.maps.LatLng(docData.location._lat, docData.location._lng);
          if(doc.id == dealerId){
            marker = new google.maps.Marker({position:{lat:docData.location._lat , lng: docData.location._long}, icon: dealerIcon, map: map});
          } else {
            marker = new google.maps.Marker({position:{lat:docData.location._lat , lng: docData.location._long}, icon: othersIcons, map: map});
          }
          

          players.push({userID: doc.id, marker : marker});
        }
      })
    // console.log(players);
      
    })
    //Listen to changes in userLocations
    db.collection("UserLocations").onSnapshot( querySnapshot => {
      querySnapshot.docChanges().forEach( change => {
        // If a new player has been added
          if(change.type === 'added'){
            // console.log(change.doc.data());
            // playerPosition = {lat: change.position.lat, lng: change.position.lng};
            // mapsPosition = new google.maps.LatLng(change.position.lat, change.position.lng,);
            // marker = new google.maps.Marker({position:{lat:change.position.lat , lng: change.position.lng}, icon: 'icons/Untitled-1.PNG', map: map});
            // marker.playerID = 'User1';
          }
          // If the plaers position has changed
          if(change.type === 'modified'){
            // console.log(change.doc.id);
            // console.log(change.doc.data());
            let newPosition = {lat: change.doc.data().location._lat, lng: change.doc.data().location._long};

            players.forEach(player => {
              // console.log(player)
                if(player.userID == change.doc.id){
                  // console.log("YAY!")
                player.marker.setPosition(newPosition)
                }
            })
          }
          // If the player has been removed
          if(change.type === 'removed'){
            players.forEach( (player, index) => {
              // console.log(player)
              if(player.userID == change.doc.id){
                  // console.log("YAY!, Player removed")
                  player.marker.setMap(null);
                  players[index] = "";
              }
            })
            //Filter out the empty indexes in the array
            // console.log('Array beeing filtered');
            players = players.filter( player => {
              return player.userID;
            })
          }
      });
    });
    // showDealers();
    initMap();
    showDealers();
  }
  else {
    console.log("Location is not available");
  }
}