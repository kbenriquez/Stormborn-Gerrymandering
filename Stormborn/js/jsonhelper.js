/**
 * 
 */
const ENTRY = "entry";
const KEY = "key";
const VALUE = "value";

//This method is meant to get the corresponding value for a key value from an automatic JSON conversion that splits up the
//two values into an entry object where the entry object has two objects in it, the key and the value.
function getEntryValue(json,key){
	var entry = json[ENTRY];
	if(entry != undefined){
		for(var i = 0; i < entry.length; i++){
			if(entry[i][KEY] == key){
				return entry[i][VALUE];
			}
		}
	}
	else{
		return undefined;
	}
}


//This is similar to previous function but will take in the outer json object from which the property is first extracted
//entryKey can be something like wastedVotes or votes, while json can be an election result, and key can be REPUBLICAN
function getEntryValueFromOuter(json,entryKey,key){
	var entry = json[entryKey][ENTRY];
	if(entry != undefined){
		for(var i = 0; i < entry.length; i++){
			if(entry[i][KEY] == key){
				return entry[i][VALUE];
			}
		}
	}
	else{
		return undefined;
	}
}
