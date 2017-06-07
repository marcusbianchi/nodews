var calculteTwosComplement = function(number){
	var bitrep = (number >>> 0).toString(2)
	if(bitrep[0]==1){
		bitrep = bitrep.substring(1,bitrep.length);
		var numRef = Math.pow(2,bitrep.length);
		return parseInt(bitrep,2) - numRef
	}
	else{
		bitrep = bitrep.substring(1,bitrep.length);
		return parseInt(bitrep,2)
	}
}

console.log(calculteTwosComplement(246));
console.log(calculteTwosComplement(231));
console.log(calculteTwosComplement(216));