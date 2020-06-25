
//Remove all inactive players from userLocations
const deleteInactivePlayers = () => {
    let conf = confirm("Do you really want to delete all the users from Userlocations?");

    if(conf){
        db.collection("UserLocations").get().then( querySnapshot => {
            console.log("lasd");
            querySnapshot.forEach( player => {
                console.log(player.id);
                db.collection("UserLocations").doc(player.id).delete()
                .catch( err => {
                    console.log(err);
                })
            })
        })
        .catch( err => {
            console.log(err + " Could not fetch data")
        })
    };
}

//Delete all targets and keys

const deleteAllTargets = () => {
    db.collection("targets").get().then( querySnapshot => {
        querySnapshot.forEach( target => {
            db.collection("targets").doc(target.id).delete();
        })
    })
    db.collection("targetKeys").get().then( querySnapshot => {
        querySnapshot.forEach( key => {
            db.collection("targetKeys").doc(key.id).delete();
        })
    })
}
//Set the opened property of all targets
const closeTargets = () => {
    let conf = confirm("Do you really want to close all targets?");

    if(conf){
        db.collection("targets").get().then( querySnapshot => {
            querySnapshot.forEach( target => {
                if(target.data().contains.recipe){
                    db.collection("recipes").doc(target.data().contains.recipe).update({
                        found: false
                    })
                }
                db.collection("targets").doc(target.id).update({
                    opened: false
                })
            })
        })
    };    
}   

//Set the locked property of all targets
const unlockTargets = () => {
    let conf = confirm("Do you really want to unlock all targets?");

    if(conf){
        db.collection("targets").get().then( querySnapshot => {
            querySnapshot.forEach( target => {
                db.collection("targets").doc(target.id).update({
                    locked: false
                })
            })
        })
    }
}

// Function to shuffle array
const shuffle = a => {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

//Function to generate random code
const codeGen = () => {
    let randomCode = "";
    for (let i = 0; i < 4; i++){
        randomCode += Math.floor(Math.random() * 10)
    }
    parseInt(randomCode, 10);
    return randomCode;
}

const generateCodesArray = number => {
    let array = [];
    let code;
    let exists = false;
    for(let i = 0; i < number; i++){
        do{
            code = codeGen();
            for(let j = 0; j < array.length; j++){
                if(array[j] == code){
                    exists = true;
                    break;
                } else{
                    exists = false;
                }
            }
        } while (exists == true)
        array.push(code);
    }
    return array;
}

//Create redeem codes
const createRedeemCodes = (points, empties) => {
    let array = [];
    let codesArray = generateCodesArray(points + empties);

    for(let j = 0; j < points; j++){
        let object = {
            points: 200,
            used: false
        }
        array.push(object);
    };

    for(let k = 0; k < empties; k++){
        let object = {
            used: false
        }
        array.push(object);
    }

    array.forEach( (code, index) => {
        db.collection("redeemCodes").doc(codesArray[index]).set(code);
    })

}
//Add new targets. Takes an array with target locations, and one with the target information 
const createTargets = (locations, targetInfo) => {
    //Declare variable to hold all target objects
    let allTargets = [];
    // Variables for code keys
    let keysArray;
    let targetKey;
    let codeExists;
    let randomCode;
    //Shuffle locations array
    shuffle(locations);

    //Generate targetKeys
    keysArray = generateCodesArray(locations.length);

    locations.forEach( (location, index) => {
        let targetObject = {
            locked: false,
            opened: false,
            position: new firebase.firestore.GeoPoint(location.latitude, location.longitude)
        }
        db.collection("targets").add(targetObject).then( target => {
            if(targetInfo[index].contains){
                let content = targetInfo[index].contains;
                targetObject.contains = content;
                targetObject.id = target.id;

                db.collection("targets").doc(target.id).update({
                    contains: targetInfo[index].contains
                })
            }

             //Create target key
            db.collection("targetKeys").doc(target.id).set({
                key: parseInt(keysArray[index], 10)
            })
            targetObject.targetKey = parseInt(keysArray[index], 10);
        })
       allTargets.push(targetObject);
    })
    return console.log(allTargets)
}

const printRedeemCodes = () => {
    db.collection("redeemCodes").get().then( querySnapshot => {
        querySnapshot.forEach(code => {
            console.log(code.id);
        } )
    })
}
// Reset the whole game
const resetGame = () => {
    let conf = confirm("ARE YOR SURE YOU WANT TO RESET THE GAME?")
        if(conf) {
            let doubleConf = confirm("Are you 100% sure you wanna do this?!?!?!");

            if(doubleConf){
                deleteInactivePlayers();
                closeTargets();
                unlockTargets(); 
            }
        }

    
    
}

//Sign in to get access to db
auth.signInWithEmailAndPassword('alex.sallberg@gmail.com', 'qwerty').then( cred => {

    //Calling functions

    // deleteInactivePlayers();
    // closeTargets();
    // unlockTargets();
    // resetGame();

    // codeGen();

    // Bread Recipe : 55.599097, 12.998071, ta70QsRJYy8mi2QSDSwY, 1234
    // Falafel recipe: 55.603136, 12.985953, DpGXreYrT6iAG9A33l4j, 6666
    // Hotsauce recipe: 55.604497, 13.009273, 7OwfSV0sKE6WA8qs903h, 1337
    // Garlic sauce recipe: 55.589326, 13.004263, jafmAs32a5cnWKOvyICX, 0420

    const targetLocations = [
        {latitude: 55.603002, longitude: 12.986349},
        {latitude: 55.595740, longitude: 12.998708},
        {latitude: 55.591777, longitude: 13.000259},
        {latitude: 55.596665, longitude: 12.995919},
        {latitude: 55.606992, longitude: 12.998979},
        {latitude: 55.606177, longitude: 13.000123},
        {latitude: 55.605545, longitude: 13.001262},
        {latitude: 55.604627, longitude: 13.001439},
        {latitude: 55.603729, longitude: 13.001151},
        {latitude: 55.603776, longitude: 12.999223},
        {latitude: 55.602529, longitude: 12.994744},
        {latitude: 55.602500, longitude: 12.999022},
        {latitude: 55.602274, longitude: 13.001876},
        {latitude: 55.602819, longitude: 13.000514},
        {latitude: 55.601134, longitude: 13.000858},
        {latitude: 55.603019, longitude: 12.996292},
        {latitude: 55.609497, longitude: 13.013653},
        {latitude: 55.606747, longitude: 13.003050},
        {latitude: 55.608371, longitude: 13.005805},
        {latitude: 55.607395, longitude: 13.008390},
        {latitude: 55.605532, longitude: 13.005725},
        {latitude: 55.603139, longitude: 13.007269},
        {latitude: 55.607987, longitude: 13.010419},
        {latitude: 55.6092002, longitude: 12.9928478},
        {latitude: 55.605313, longitude: 12.997142},
        {latitude: 55.606932, longitude: 12.997486},
        {latitude: 55.607234, longitude: 12.995025},
        {latitude: 55.609328, longitude: 12.995692},
        {latitude: 55.594465, longitude: 13.013256},
        {latitude: 55.6015057, longitude: 12.9951964},
        {latitude: 55.6004234, longitude: 12.9903637},
        {latitude: 55.597432, longitude: 12.9924622},
        {latitude: 55.5946362, longitude: 12.997820299999999},
        {latitude: 55.593807999999996, longitude: 13.000754299999999},
        {latitude: 55.5942988, longitude: 13.010156799999999},
        {latitude: 55.5992098, longitude: 13.0102929},
        {latitude: 55.6002404, longitude: 13.006120699999999},
        {latitude: 55.5985559, longitude: 13.007002799999999},
        {latitude: 55.605245, longitude: 12.999082},
        {latitude: 55.599669, longitude: 12.998440},
        {latitude: 55.599931, longitude: 13.001593},
        {latitude: 55.599101, longitude: 12.999779},
        {latitude: 55.599641, longitude: 12.995723},
        {latitude: 55.602847, longitude: 13.001852},
        {latitude: 55.602092, longitude: 13.003382},
        {latitude: 55.605601, longitude: 12.991462}
    ];

//     ,   Lillatorg telefonkisok 

// ,    davids torg, vid busken mittemot polishuset

// ,   Hörnet vid bullen, i stan

// ,  Kärleksgatan vid det cafet 

// ,  Bussplatsen vid petriskolan 

// ,   sidgata till gustav adolfs torg, i ett litet håi väggen 

// ,   vid MENY grillbar 

// ,  high court slottparken 

// 55.600619, 12.995008 Statyn vid malmö stadsbibliotek 


    const targetContents = [
        // {contains: {points: 666}},
        {},
        {},
        {},
        {},
        {},
        {},
        {contains: {cash: 1500}},
        {contains: {cash: 1500}},
        {contains: {cash: 1000}},
        {contains: {cash: 1000}},
        {contains: {cash: 1000}},
        {contains: {cash: 1000}},
        {contains: {cash: 500}},
        {contains: {cash: 500}},
        {contains: {cash: 500}},
        {contains: {cash: 500}},
        {contains: {cash: 500}},
        {contains: {cash: 500}},
        {contains: {cash: 500}},
        {contains: {cash: 500}},
        {contains: {cash: 500}},
        {contains: {cash: 500}},
        {contains: {cash: 500}},
        {contains: {cash: 500}},
        {contains: {cash: 500}},
        {contains: {cash: 500}},
        {contains: {cash: 500}},
        {contains: {cash: 500}},
        {contains: {cash: 500}},
        {contains: {cash: 500}},
        {contains: {cash: 500}},
        {contains: {artefact: "an old falafel scoop", points: 200}},
        {contains: {artefact: "an old falafel scoop", points: 200}},
        {contains: {artefact: "an old falafel scoop", points: 200}},
        {contains: {artefact: "an old falafel scoop", points: 200}},
        {contains: {artefact: "an old falafel scoop", points: 200}},
        {contains: {artefact: "an old falafel scoop", points: 200}},
        {contains: {artefact: "an old falafel scoop", points: 200}},
        {contains: {artefact: "an old falafel scoop", points: 200}},
        {contains: {artefact: "an old falafel scoop", points: 200}},
        {contains: {artefact: "Some old falafel spices", points: 200}},
        {contains: {artefact: "Some old falafel spices", points: 200}},
        {contains: {artefact: "Some old falafel spices", points: 200}},
        {contains: {artefact: "Some old falafel spices", points: 200}},
        {contains: {artefact: "Some old falafel spices", points: 200}},
        {contains: {artefact: "Some old falafel spices", points: 200}}
    ];
    
    // createTargets(targetLocations, targetContents);

    // createRedeemCodes(50,10);
    // printRedeemCodes();

    

})


