

window.findPath = function(_start, _end, _map){
	var pathFindLog = function (message){
		//console.log(message);
	}

	var startTime= Date.now();

	var weights = [];

	var weightDico = {};

	var ancestors = {};

	// initialisation
	var index = 0;
	for(var node in _map){
		var currentNode = {node:node,childs:_map[node], weight:-1,visited:false};
		if(node == _start){
			currentNode.weight = 0;
		}
		weights.push(currentNode);

		weightDico[node] = index++;

		ancestors[node] = [];
	}


	//On recherche le noeud non parcouru ayant le poids le plus faible et on indique donc qu'on l'a parcouru
	var unvisitedLighterNodes = getUnvisitedLighterNodes(weights);

	while(unvisitedLighterNodes[0] != _end && unvisitedLighterNodes != false){

		for(var weightI=0;weightI<unvisitedLighterNodes.length;weightI++){
			var fatherNode = unvisitedLighterNodes[weightI];
			fatherNode.visited = true;

			//On va rechercher "les fils" du noeud où l'on se trouve
			var childs = fatherNode.childs;


			for(var childI=0;childI<childs.length;childI++){
				var currentChildNode = childs[childI];

				var currentChild = weights[weightDico[currentChildNode]];

				pathFindLog(currentChildNode +" inspecting :" + currentChild);

				// SI ( le noeud-fils n'a pas encore été parcouru )
				// ET QUE ( Poids(Noeud-père) + Poids(Liaison Noeud-père/Noeud-fils) < Poids(Noeud-fils) ) OU Poids(Noeud-fils) = -1 


				// la distance entre chaque case est de 1
				//if(!currentChild.visited && ((fatherNode.weight + 1 < currentChild.weight) || currentChild.weight == -1)) {
				if(!currentChild.visited && ((fatherNode.weight + 1 <= currentChild.weight) || currentChild.weight == -1)) {
					

					//Poids(Noeud-fils) = Poids(Noeud-père) + Poids(Liaison Noeud-père/Noeud-fils)
					currentChild.weight = fatherNode.weight + 1;

					//Antecedent(Noeud-fils) = Noeud-Père
					ancestors[currentChild.node].push(fatherNode.node);
				}
			}
		}
		unvisitedLighterNodes = getUnvisitedLighterNodes(weights);
	}

	pathFindLog("duration : " + (Date.now() - startTime));

	// on se place sur l'ancestor de l'arrivée
	// on cree un chemin à partir de la fin
	/*
	var initialPath = {id:0, currentNode:_end, path:[]};
	var paths = [initialPath];
	recursiveExplorePath(ancestors, initialPath, _start, paths);


	console.log("there is " + paths.length + " path from " + _start + " to " + _end);

	for (var i = 0; i < paths.length; i++) {
		var path = paths[i].path;
		paths[i].path = path.reverse();
		console.log("path : ") + path.id;
		for(var pathI=0;pathI<path.length;pathI++){
			console.log("- " + path[pathI]);
		}
	}
*/
	return ancestors;
};
recursiveExplorePath=function(_ancestors, _currentPath, _start, _paths) {
   while(_currentPath.currentNode != _start){

		var currentAncestors = _ancestors[_currentPath.currentNode];
   	// cas avec un seul ancetre
   	// on ajoute le noeud courant au chemin
		_currentPath.path.push(_currentPath.currentNode);

		for (var i = 1; i < currentAncestors.length; i++) {
			

			var clonned_path = clone(_currentPath);

			clonned_path.currentNode = currentAncestors[i];
			_paths.push(clonned_path);
			recursiveExplorePath(_ancestors, clonned_path, _start, _paths);
		};


		//le noeud courant devient l'ancètre
		_currentPath.currentNode = currentAncestors[0];
   }
   _currentPath.path.push(_start);
};
clone=function(a) {
   return JSON.parse(JSON.stringify(a));
};
getUnvisitedLighterNodes = function(_weights){

	var unvisitedLighterNodes = false;
	var lesserWeight = 2048;

	for(var weightI=0;weightI<_weights.length;weightI++){
		
		var currentWeightNode = _weights[weightI];

		if (currentWeightNode.visited || currentWeightNode.weight == -1) {continue;}


		if(currentWeightNode.weight > lesserWeight){
			continue;
		}

		if(currentWeightNode.weight == lesserWeight){
			unvisitedLighterNodes.push(currentWeightNode);
			continue;
		}

		if(currentWeightNode.weight < lesserWeight){
			unvisitedLighterNodes = [currentWeightNode];
			lesserWeight = currentWeightNode.weight;
			continue;
		}
	}
	return unvisitedLighterNodes;
};
pathFindLoaded = true;