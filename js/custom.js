    let players = (localStorage.getItem("playersData")) ? JSON.parse(localStorage.getItem("playersData")) : [];
	let games = (localStorage.getItem("gamesData")) ? JSON.parse(localStorage.getItem("gamesData")) : [];
	let playersTable = new DataTable('#playersTable', {
		fixedHeader: true,
		dom: 'Bftip',
        pageLength: 30,
		responsive: true,
		columns: [
            {data: 'name', title : 'Player Name'},
            {data: 'matchesPlayedCount', title : 'Matches Played'},
            {
				data: 'willingToPlayASAP',
				title : 'Play Immediately',
				visible : false,
				render: function(data, type){
					return data === true ? "Yes" : "No"
				}
			},
			{
				data: 'playedRecently',
				title : 'Played Recently',
				visible : false,
				render: function(data, type){
					return data === true ? "Yes" : "No"
				}
			},
            {
				title : 'Action',
				data: 'actions',
				render: function(data){
					return data;
				}
			},
        ],  
		data : getPlayers()
	});

	let gamesTable = new DataTable('#gamesTable', {
		fixedHeader: true,
		dom: 'Bftip',
        pageLength: 30,
		columns: [
			{
				title : 'Match Number',
				className : 'dt-body-center dt-center'
			},
            {title : 'Player Name', visible : false},
            {title : 'Player Name', visible : false},
            {title : 'Player Name', visible : false},
            {title : 'Player Name', visible : false},
			{title : 'Players', className : 'word-break'}
        ],  
		data : getGames()
	});

    // Add query params in url to activate this
	$(function () {
        const urlInfo = new URL(location.href);
        if(urlInfo.searchParams.get('clearPlayers') === "1"){
            // console.log("clear")
            if(confirm("Sure ka na ba na ligwakin ang mga players? Ayusin mo nako")){
                localStorage.removeItem('playersData')
            }
        }
        if(urlInfo.searchParams.get('clearGames') === "1"){
            // console.log("clears")
            if(confirm("Sure ka na ba na idelete ang mga game history? Pakisiguro mabuti nako")){
                localStorage.removeItem('gamesData')
            }
        }
		getDropDownData();
		$('#btnSearch').click(function () {
			generatePlayers();
		});
	})

	function getPlayers(){
		return JSON.parse(localStorage.getItem("playersData"));
	}

	function getGames(){
		return JSON.parse(localStorage.getItem("gamesData"));
	}


	function getRandomNumber (min, max){
		return Math.floor(Math.random() * (max - min)) + min
	}

	function validateInput(name, playImmediately){
		let playerExists = false;

		if(getPlayers()){
			playerExists = getPlayers().find(player => { 
				return playImmediately === null ? (player.name === name)  : (player.name === name && player.willingToPlayASAP === playImmediately)
			});
		}
		
		if (!name || !name.trim()) {
			return {
				result : false,
				message : "BAWAL MAGLARO YUNG WALANG PANGALAN!!!"
			};
		}
		if(playerExists){
			return {
				result : false,
				message : "MAY GANYAN NA PRI"
			}
		}

		return { 
			result : true
		}
	}

	function clearDropDownData(){
		$('.player-dropdown').empty();
		$('.player-dropdown').append(`<option value="">Select player</option>`);
	}

	function getDropDownData(){
		clearDropDownData();
		if(getPlayers()){
			getPlayers().forEach(element => {		
			$('.player-dropdown').append($('<option>', {
				value: element.name,
				text: element.name
			}));
		});
		}
	}

	function addPlayer() {
		// Get input values
		// Added checking if player exists
		let name = document.getElementById("nameInput").value;
		let validationResult = validateInput(name, null);
		if(validationResult.result === false){
			Swal.fire({
				title: "Player already inputted",
				text: "WAG MO PINDUTIN SI ANGER",
				imageUrl: "./images/anger.gif",
				imageWidth: 200,
				imageHeight: 200,
				imageAlt: "May ganyan na 2ll"
			});
		}
		else {
			let action = '<button type="button" class="clr-primary" onclick="editPlayer(this)"><i class="mdi mdi-pencil"></i></button> &nbsp;' +
				'<button type="button" class="clr-primary" onclick="deletePlayer(this)"><i class="mdi mdi-delete"></i></button>';

			// Insert to players array then set to playersData in localStorage
			let playerInfo = { 
				'name' : name,
				'matchesPlayedCount' : 0,
				'willingToPlayASAP' : $("#addPlayerPlayImmediately").prop('checked'),
				'playedRecently' : false,
				'actions' : action
			}
			players.push(playerInfo);
			localStorage.setItem("playersData", JSON.stringify(players));
			reloadPlayersTable();
			clearInputs();
			getDropDownData();
		}  
	}

	function editPlayer(button) {	
		// Get the parent row of the clicked button
		let row = button.parentNode.parentNode;
		let name = row.cells[0].innerHTML;
		let playImmediately = row.cells[2].innerHTML === "Yes";
		$("#playerNameInput").data("prevInput",name)
		$("#playerNameInput").val(name);
		$("#playImmediately").data("prevInput", playImmediately);
		$("#playImmediately").prop("checked", playImmediately);
		$("#playerModal").modal("show");
	
	}

	function saveChanges(){
		let nameInput = $("#playerNameInput").val();
		let prevInput = $("#playerNameInput").data("prevInput");
		let playImmediately =  $("#playImmediately").prop('checked');
		let validateResult = validateInput(nameInput, playImmediately);
		if(validateResult.result === false){			
			Swal.fire({
				title: "No change in player details",
				text: "WAG MO PINDUTIN SI ANGER",
				imageUrl: "./images/anger.gif",
				imageWidth: 200,
				imageHeight: 200,
				imageAlt: "May ganyan na 2ll"
			});
		}
		else{
			players = players.map((player) => {
				if(player.name === prevInput){
					player.name = nameInput;
					player.willingToPlayASAP = playImmediately;
				}
				return player;
			})
			// Update localStorage
			localStorage.setItem("playersData", JSON.stringify(players));
			// Update UI
			reloadPlayersTable();
			Swal.fire({
				title: "Player added successfully",
				text: "Eyy ka muna, EYYY",
				imageUrl: "./images/eyy.gif",
				imageWidth: 200,
				imageHeight: 200,
				imageAlt: "Eyy ka muna"
			});
			$("#playerModal").modal("hide");
		}	
	}

	function deletePlayer(button) {
		// Get the parent row of the clicked button
		let row = button.parentNode.parentNode;
		let nameCell = row.cells[0];
		if (confirm('Ligwakin na si ' + nameCell.innerHTML + '?')) {
			$(".player-dropdown option[value='" + nameCell.innerHTML + "']").remove();
			players = players.filter(player => {
				if(player.name !== nameCell.innerHTML){
					return player;
				}
			})

			// Update localStorage
			localStorage.setItem("playersData", JSON.stringify(players));
			Swal.fire({
				title: "Player deleted",
				text: "Bye lodi, you will be missed",
				imageUrl: "./images/bye.gif",
				imageWidth: 200,
				imageHeight: 200,
				imageAlt: "Bye lodi"
			});
			// Update UI
			reloadPlayersTable();


		}
	}

    // Unfinished Business.

    // function getLowest(){
    //     return players.reduce((previous, current) => {
    //         return current.matchesPlayedCount < previous.matchesPlayedCount ? current : previous;
    //     });
    // }

    // function getHighest(){
    //     return players.reduce((previous, current) => {
    //         return current.matchesPlayedCount > previous.matchesPlayedCount ? current : previous;
    //     });
    // }

	function generateMatchUp(){
		// Initialize Variable Match ups

		let generatedNumbers = [];
		let generatedPlayers = [];
		let prevPlayers = (games.length > 0) ? games[games.length - 1] : [];
		let players = getPlayers();
		let i=0;

		if(players.length > 3){
			// Filter players removing previous players
			let filteredPlayers = players.filter(function(player){
		
				// Check if players in previous players
				// Else return player
				
				if(prevPlayers.includes(player.name)){
					// Check if player is willing to play ASAP
					// If willing to play ASAP check if player did not play recently
					// Else remove player by skipping
					if(player.willingToPlayASAP){
						// Check if player did play recently
						// If played recently, return player for eligibility to play again
						// Else return player
						if(player.playedRecently){
							// Check if played 2 consecutive matches. If not return player
							if((player.matchesPlayedCount > 1) && (player.matchesPlayedCount % 2 == 1)){
								return player
							}
						}
						else{
							return player;
						}
					}
				}
				else{
					return player;
				}
			})

			// Get 4 random players based on filtered list
			while(i <= 3){

				console.log(players.length, filteredPlayers.length)
				
				// generate random number 
				let rowLength = filteredPlayers.length > 3 ? filteredPlayers.length : players.length;
				let generatedNumber =getRandomNumber(0, rowLength);
				// check if in generatedNumbers list
				if(generatedNumbers.includes(generatedNumber)){
					// if true, generate a new number
					generatedNumber = getRandomNumber(0, rowLength);
				}
				else{
					// else push to generatedNumbers list and push to generatedPlayers list
					// repeat until 4

					// if less than 8 players, repush from players list but avoid duplicates 
					if(filteredPlayers.length < 4){
						generatedNumber =  getRandomNumber(0, players.length);
						if(!generatedPlayers.includes(players[generatedNumber]['name']) && generatedPlayers.length > 3){
							generatedPlayers.push(players[generatedNumber]['name']);
						}
						else{
							break;
						}
					}
					else{
						console.log("TER");
						generatedNumbers.push(generatedNumber);
						generatedPlayers.push(filteredPlayers[generatedNumber]['name']);                     
						i++;
					}
				}
			}
			setDropdownPlayers(generatedPlayers);
		} 

	}

	function setDropdownPlayers(players){
		// set in dropdown via jquery
		players.forEach((player, index) => {
			$(`#match_p${index+1}`).val(player);
		});
	}

	function saveMatch(){
		let selectedPlayers = [];		
		selectedPlayers.push((games.length) + 1)
		$(`.player-dropdown`).each(function(index, elem){
			let dropdownValue = $(elem).val();
			selectedPlayers.push(dropdownValue);
		})

		players = players.map(function(player){
			if(selectedPlayers.includes(player.name)){ 
                player.matchesPlayedCount = player.matchesPlayedCount + 1;
                player.playedRecently = true;       
			}
            else{
                if((player.matchesPlayedCount % 2 === 0) && (player.matchesPlayedCount > 1) && (player.playedRecently === true)){
                    player.playedRecently = false;    
                }
            }
			return player;
		})
		let hasPlayers = selectedPlayers.slice(1,selectedPlayers.length).every(Boolean);
		if(hasPlayers){
			let stringifyPlayers = selectedPlayers.slice(1,selectedPlayers.length).join(', ');
			selectedPlayers.push(stringifyPlayers);
			localStorage.setItem("playersData", JSON.stringify(players));
			games.push(selectedPlayers);
			localStorage.setItem('gamesData', JSON.stringify(games));
			reloadGamesTable();
			reloadPlayersTable();
		}
		else{
			Swal.fire({
				title: "No players selected",
				text: "WAG KANG MACOLET PLS",
				imageUrl: "./images/anger.gif",
				imageWidth: 200,
				imageHeight: 200,
				imageAlt: "Maglagay kang players ano ba?"
			});
		}
	}

	function clearInputs() {
		// Clear input fields
		document.getElementById("nameInput").value = "";
	}
	
	function clearPlayers(){
		$(".player-dropdown").val("");
	}

	function reloadGamesTable(){
		gamesTable.clear().rows.add(getGames()).draw();
	}

	function reloadPlayersTable(){
		playersTable.clear().rows.add(getPlayers()).draw();
	}
	
	function addPlayers() {
		// Get input values
		let name = document.getElementById("playersInput").value;

		if (name == "") {
			alert("Wala palang naglaro bakit mo ia-add?");
		}
		else {
			let table = document.getElementById("gamesTable");
			var ctr = table.rows.length + 1;
			let newRow = table.insertRow(table.rows.length);
			
			// Insert data into cells of the new row
			let nextCell = newRow.insertCell(0);
			nextCell.innerHTML = ctr.toString() + ". " + name;
			newRow.insertCell(1).innerHTML =
				'<button type="button" class="clr-primary" onclick="editHistory(this)"><i class="mdi mdi-pencil"></i></button> &nbsp;' +
				'<button type="button" class="clr-primary" onclick="deleteHistory(this)"><i class="mdi mdi-delete"></i></button>';
		}
		
		document.getElementById("playersInput").value = "";
		reloadPlayersTable();
	}
	
	function deleteHistory(button) {
		// Get the parent row of the clicked button
		let row = button.parentNode.parentNode;
		row.parentNode.removeChild(row);
	}
	
	function editHistory(button) {

		// Get the parent row of the clicked button
		let row = button.parentNode.parentNode;

		// Get the cells within the row
		let nameCell = row.cells[0];

		// Prompt the user to enter updated values
		let nameInput =
			prompt("Enter the updated players:",
				nameCell.innerHTML);

		nameCell.innerHTML = nameInput;
	}

	function generatePlayers() {
		var games = $('#txtGames').val();
		var allPlayers = $('#txtPlayers').val();
        const firstSetofPlayers = [];
		
		let empHTML = "";
		document.getElementById("tblResult").innerHTML = "";

		if (allPlayers != null && allPlayers != "" && games != null && games != "" & games != 0) {
			//allPlayers = JSON.parse("[" + allPlayers + "]");
			allPlayers = allPlayers.split(',');;

			//alert(allPlayers + " = " + allPlayers.length);
			
			firstSetofPlayers.push(allPlayers[0]);
			firstSetofPlayers.push(allPlayers[1]);
			firstSetofPlayers.push(allPlayers[2]);
			firstSetofPlayers.push(allPlayers[3]);

            
			for (i = 1; i <= games; i++) {
				const currPlayers = [];
				const nextPlayers = [];
				var updatedPlayers = [];
				var x = "";

				for (j = 0; j < allPlayers.length; j++) {
					if (j < 4) {
						currPlayers.push(allPlayers[j]);
					}
					else {
						nextPlayers.push(allPlayers[j]);
					}
				}
				
				if (i != 1 && currPlayers[0] == firstSetofPlayers[0] && currPlayers[1] == firstSetofPlayers[1] && currPlayers[2] == firstSetofPlayers[2] && currPlayers[3] == firstSetofPlayers[3]){
					updatedPlayers = shuffleArray(allPlayers);
					allPlayers = updatedPlayers;
					firstSetofPlayers.push(allPlayers[0]);
					firstSetofPlayers.push(allPlayers[1]);
					firstSetofPlayers.push(allPlayers[2]);	
					firstSetofPlayers.push(allPlayers[3]);
					x = " repeat";
				}
				else{
					updatedPlayers = $.merge(nextPlayers, currPlayers);
					allPlayers = updatedPlayers;
					
					empHTML += "<tr>";
					empHTML += "<td><b> Game #" + i +"</b><br/><i>" +currPlayers + x + "</i><br/><b>Shuffled: " + shuffleArray(currPlayers) + "</b></td>";
					empHTML += "<td>" + '<input class="form-check-input" type="checkbox" value="">' + "</td>";
					empHTML += "</tr>";
				}
				
				
			}

			document.getElementById("tblResult").innerHTML = empHTML;
		}
		else {
			alert("Error. Check inputs.");
		}
	}

	function shuffleArray(array) {
		for (var i = array.length - 1; i > 0; i--) {

			// Generate random number 
			var j = Math.floor(Math.random() * (i + 1));

			var temp = array[i];
			array[i] = array[j];
			array[j] = temp;
		}

		return array;
	}

	function bindPlayers() {
		var allPlayers = "";
		$('#playersTable tr').each(function () {
			let thisPlayer = $(this).find(".nameCell").html();
			if (typeof thisPlayer != "undefined") {
				//allPlayers += thisPlayer + " ";

				//alert(allPlayers);

				$('.players-dropdown').append($('<option>', {
					value: thisPlayer,
					text: thisPlayer
				}));

			}
		});
	}

	function addCount(button) {

		// Get the parent row of the clicked button
		let row = button.parentNode.parentNode;

		// Get the cells within the row
		let countCell = row.cells[1];

		var count = parseFloat(countCell.innerHTML) + 1;

		// Update the cell contents with the new values
		countCell.innerHTML = count;
	}

	function subtractCount(button) {

		// Get the parent row of the clicked button
		let row = button.parentNode.parentNode;

		// Get the cells within the row
		let countCell = row.cells[1];

		var count = parseFloat(countCell.innerHTML);

		if (count > 0) {
			count -= 1;
		}

		// Update the cell contents with the new values
		countCell.innerHTML = count;

	}