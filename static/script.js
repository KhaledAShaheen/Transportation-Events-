$(document).ready(function() {
    var searchForm = $('#search-form');
    
    function updateRequiredAttributes() {
        // Enable the appropriate input based on the selected search type
        var searchType = $('input[name="searchType"]:checked').val();
        
        // Disable all inputs first
        $('#personId, #linkId, #linkIdLinkTable, #visPersonId, #visStartTime, #visEndTime').prop('disabled', true).val('');
        $('#timeRange, #visualizationOptions').hide();

        switch(searchType) {
            case 'personId':
                $('#personId').prop('disabled', false);
                $('#timeRange').hide();
                $('#search').show();
                $('#visualization-button').hide();
                break;
            case 'linkId':
                $('#linkId').prop('disabled', false);
                $('#timeRange').show();
                $('#search').show();
                $('#visualization-button').hide();
                break;
            case 'linkIdLinkTable':
                $('#linkIdLinkTable').prop('disabled', false);
                $('#timeRange').hide();
                $('#search').show();
                $('#visualization-button').hide();
                break;
            case 'visualization':
                $('#visualizationOptions').show();
                $('#visPersonId, #visStartTime, #visEndTime').prop('disabled', false);
                $('#visualization-button').show();
                $('#search').hide();
                break;
        }
    }

    // Initialize the form state
    updateRequiredAttributes();
    
    $('input[name="searchType"]').change(updateRequiredAttributes);

    searchForm.on('submit', function(e) {
        e.preventDefault();
        var searchType = $('input[name="searchType"]:checked').val();
        var searchId = $('#' + searchType).val();
        var startTime = $('#startTime').val();
        var endTime = $('#endTime').val();
        
        // For visualization, you might want to call a different function or the same function with additional parameters
        if(searchType === 'visualization') {
            var visPersonId = $('#visPersonId').val();
            var visStartTime = $('#visStartTime').val();
            var visEndTime = $('#visEndTime').val();
            // Add here the function to handle visualization, e.g., visualizeEvents(visPersonId, visStartTime, visEndTime);
        } else {
            // Existing functionality for searching events
            searchEvents(searchType, searchId, startTime, endTime);
        }
    });
});
function searchEvents(searchType, searchId, startTime, endTime) {
    var queryParam = searchType + '=' + encodeURIComponent(searchId);
    
    // Ensure startTime and endTime are only appended for linkId searchType
    if (searchType === 'linkId' && startTime && endTime) {
        queryParam += '&startTime=' + encodeURIComponent(startTime);
        queryParam += '&endTime=' + encodeURIComponent(endTime);
    }
    fetch('/search?' + queryParam)
        .then(response => response.json())
        .then(events => {
               // Construct the table if not already present
            if ($.fn.DataTable.isDataTable('#eventsTable')) {
                $('#eventsTable').DataTable().destroy();
            }
            $('#events').empty();
            var tableHtml;
            if(searchType == 'personId' || searchType == 'linkId'){
                tableHtml = `
                <table id="eventsTable" class="display centered-table">
                    <thead>
                        <tr>
                            <th>Event ID</th>
                            <th>Type</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${events.map(event => `
                            <tr>
                                <td>${event.eventid}</td>
                                <td>${event.type}</td>
                                <td>${event.time}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            }             
            else{
                tableHtml = `
                <table id="eventsTable" class="display centered-table">
                    <thead>
                        <tr>
                            <th>FreeSpeed</th>
                            <th>Capacity</th>
                            <th>Mode</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${events.map(event => `
                            <tr>
                                <td>${event.freespeed}</td>
                                <td>${event.capacity}</td>
                                <td>${event.mode}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            }

            $('#events').html(tableHtml);
            // Initialize DataTables
            $('#eventsTable').DataTable({
                // DataTables initialization options
                destroy: true, // This option allows re-initialization on the same table
                autoWidth: false, // This can help with rendering issues in some cases
                language: {
                emptyTable: "No Data Found!" // Custom message for an empty table
                }
                
            });
          
        })
        .catch(error => {
            console.error('Error:', error);
            $('#events').html('Error fetching events.');
        });
}

document.addEventListener('DOMContentLoaded', function() {
    var visualizationButton = document.getElementById('visualization-button');

    if (visualizationButton) {
        visualizationButton.addEventListener('click', function() {
            var searchType = $('input[name="searchType"]:checked').val();

            if(searchType=='visualization'){

            
            // Retrieve the visualization parameters from the form
            var visPersonId = document.getElementById('visPersonId').value;
            var visStartTime = document.getElementById('visStartTime').value;
            var visEndTime = document.getElementById('visEndTime').value;

            // Construct the query string with parameters
            var queryParams = new URLSearchParams({
                personId: visPersonId,
                startTime: visStartTime,
                endTime: visEndTime
            });

            fetch('/visualize?' + queryParams.toString())
            .then(response => response.text())  // Get the response text (HTML)
            .then(data => {
                const mapContainer = document.getElementById('mapid');
                mapContainer.innerHTML = data;  // Insert the map HTML into the container
            })
            .catch(error => {
                console.error('Error fetching the map:', error);
            });
        }
        else{
            console.error('Error fetching the map:');

        }
        });
    }
});

function handleFiles(files) {
    // Display file names
    let fileList = document.getElementById('file-list');

    
    let numberOfFiles = fileList.querySelectorAll('p').length;
    if(numberOfFiles==2){
        fileList.innerHTML = "";
    }

    for (const file of files) {
        fileList.innerHTML += `<p>${file.name}</p>`;
    }
}

function handleDrop(event) {
    event.preventDefault();
    let files = event.dataTransfer.files;
    document.getElementById('file-input').files = files;
    handleFiles(files);
}

function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
}

function browseFiles() {
    document.getElementById('file-input').click();
}

function processFiles(){
    let files = document.getElementById('file-input').files;
    var progressBarContainer = document.getElementById('progress-bar-container');

    progressBarContainer.style.display = 'block';

    if(files.length === 0){
        alert("Error: Upload 2 Files");
        return;
    }
    let formData = new FormData();
    for (const file of files) {
        formData.append('files', file);
    }
    fetch('/importData',{
        method: 'POST',
        body: formData
    })
    .catch(error => console.error('Error:', error));


}