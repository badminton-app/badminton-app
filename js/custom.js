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
				render: function(data, type){
					return data === true ? "Yes" : "No"
				}
			},
			{
				data: 'playedRecently',
				title : 'Played Recently',
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
		responsive: true,
        pageLength: 30,
		columns: [
			{
				title : 'Match Number',
				className : 'dt-body-center dt-center'
			},
            {title : 'Player Name'},
            {title : 'Player Name'},
            {title : 'Player Name'},
            {title : 'Player Name'}
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

	function isPlayerNameValid(name){
		let playerExists = false;

		if(getPlayers()){
			playerExists = getPlayers().find(player => { 
				return (player.name === name)
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
		let validationResult = isPlayerNameValid(name);
		if(validationResult.result === false){
			alert(validationResult.message)
		}
		else {
			// Get the table and insert a new row at the end
			let table = document.getElementById("playersTable");
			let action = '<button type="button" class="clr-primary" onclick="addCount(this)"><i class="mdi mdi-plus"></i></button> &nbsp;' +
				'<button type="button" class="clr-primary" onclick="subtractCount(this)"><i class="mdi mdi-minus"></i></button> &nbsp;' +
				'<button type="button" class="clr-primary" onclick="editPlayer(this)"><i class="mdi mdi-pencil"></i></button> &nbsp;' +
				'<button type="button" class="clr-primary" onclick="deletePlayer(this)"><i class="mdi mdi-delete"></i></button>';

			// Insert to players array then set to playersData in localStorage
			let playerInfo = { 
				'name' : name,
				'matchesPlayedCount' : 0,
				'willingToPlayASAP' : Math.random() < 0.5,
				'playedRecently' : Math.random() < 0.5,
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

		// Get the cells within the row
		let nameCell = row.cells[0];
		let prevName = nameCell.innerHTML;

		// Prompt the user to enter updated values
		// Added validation to prevent same name
		let nameInput =
			prompt("Enter the updated name:",
				nameCell.innerHTML);

		let validationResult = isPlayerNameValid(nameInput);

		if(validationResult.result === false){
			alert(validationResult.message)
		}
		else{
			players = players.map((player) => {
				if(player.name === prevName){
					player.name = nameInput;
				}
				return player;

			})
			// Update localStorage
			localStorage.setItem("playersData", JSON.stringify(players));
			// Update UI
			reloadPlayersTable();
		}		
	}

	function deletePlayer(button) {
		// Get the parent row of the clicked button
		let row = button.parentNode.parentNode;
		let nameCell = row.cells[0];

		console.log(nameCell.innerHTML);
		if (confirm('Ligwakin na si ' + nameCell.innerHTML + '?')) {
			$(".player-dropdown option[value='" + nameCell.innerHTML + "']").remove();
			players = players.filter(player => {
				if(player.name !== nameCell.innerHTML){
					return player;
				}
			})

			// Update localStorage
			localStorage.setItem("playersData", JSON.stringify(players));

			// Update UI
			reloadPlayersTable();
			alert('Bye.');

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

			// generate random number
			let generatedNumber = getRandomNumber(0, filteredPlayers.length);

			// check if in generatedNumbers list
			if(generatedNumbers.includes(generatedNumber)){
				// if true, generate a new number
				generatedNumber = getRandomNumber(0, filteredPlayers.length);
			}
			else{
				// else push to generatedNumbers list and push to generatedPlayers list
				// repeat until 4

                // if less than 8 players, repush from players list but avoid duplicates 
                if(filteredPlayers.length < 4){
                    generatedNumber =  getRandomNumber(0, players.length);
                    if(!generatedPlayers.includes(players[generatedNumber]['name'])){
                        generatedPlayers.push(players[generatedNumber]['name']);
                    }
                    else{
                        continue;
                    }
                }
                else{
                    generatedNumbers.push(generatedNumber);
                    generatedPlayers.push(filteredPlayers[generatedNumber]['name']);                     
                    i++;
                }
			}
		}
		setDropdownPlayers(generatedPlayers);
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

		localStorage.setItem("playersData", JSON.stringify(players));
		games.push(selectedPlayers);
		localStorage.setItem('gamesData', JSON.stringify(games));
		reloadGamesTable();
		reloadPlayersTable();
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