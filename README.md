###cfeoPopulate
============

 A custom jQuery plugin designed to populate web forms from dynamically loaded data.  Although primarily written to work with ColdFusion data, it should work with any properly formatted data.

 When generating data you can utilize an array, array of structures or recordset data from queries, either a single row query, or multiple row query where the data is defined in a name/value pairing.  

```
##Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/license
```

```
# Single row queries (row count = 1)

<cfset temp = QuerySetCell(myQuery, "firstName", “John", 1)>
<cfset temp = QuerySetCell(myQuery, "lastName", “Doe", 1)>
```

```
# Multiple row queries (row count = 1 row per item)

<cfset temp = QuerySetCell(myQuery, "fieldName", "firstName", 1)> 
<cfset temp = QuerySetCell(myQuery, "fieldValue", "John", 1)> 
<cfset temp = QuerySetCell(myQuery, "fieldName", "lastName", 2)> 
<cfset temp = QuerySetCell(myQuery, "fieldValue", "Doe", 2)> 
```

```
# Arrays

As an example of an array or array of structures you could take the data from the multiple row queries above (myQuery) and loop over the data as shown below.

<cfloop query="myQuery">
	<cfset row = {} />

	<!--- Add each column to our struct. --->
	<cfloop index="column" list="#myQuery.columnList#" delimiters=",">
		<cfset row[ column ] = myQuery[ column ][ myquery.currentRow ] />
	</cfloop>

	<!--- Append the row struct to the row array. --->
	<cfset arrayAppend( rows, row ) />
</cfloop>
<cfset returnData = rows>

```
The plugin looks at the response data it has been provided with and tries to determine what type of data it has to work with ( Array [json array of structures],   json serialized by query [ wddx compatible],  json [query format] ), iterates over the data and creates a data object that will be used to populate the form.

As it loops over each input in the form it determines the type (checkbox, text, select, radio, etc.) or name of the input and redirects to a specific action for that input type.  If the data object contains a value that matches the local input it will update the local input with that value, including correctly selecting/unselecting items within checkboxes, radio buttons, select and multiple select inputs.


```
# Example to load/reload a form using jQuery – including eoCFpopulate.js plugin

$('.load-form').click(function(){
	$.ajax({
	type: 'GET',
	url: '/controllers/controllerName.cfc?method=getDataMethod&returnFormat=jsonQuery',
	beforeSend: function(x) {
	  if(x && x.overrideMimeType) {
	   x.overrideMimeType("application/j-son;charset=UTF-8");
	  }
	 },
	dataType: "json",

	success: function(response) {
	
	// populate form with custom plugin - use returned JSON data
	$('#formID).cfeoPopulate(response,{fieldName:"FIELDNAME",fieldValue:"FIELDVALUE"});				
									
	}, 
	error: function(errorMsg){
		// output any error messages in a pre-defined area
		$('.form-results').html(errorMsg);
									}
	});
	return false;
```