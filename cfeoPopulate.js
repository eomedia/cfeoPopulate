/*
 * jQuery cfeoPopulate Form v1
 * Copyright (c) 2012 Ryan Smith
 * http://www.eoMedia.com/
 *
 * Description:
 * iterate over form and populate field data with data from ColdFusion data set
 *
 * 
 * Depends:
 *   - jQuery 1.4.2+
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *   
 * Usage within cfeoFramework
 *   - $('#formName').cfeoPopulate(response,{fieldName:"FIELDNAME",fieldValue:"FIELDVALUE"}); 
 *
*/
(function($) {
	$.fn.extend({
		cfeoPopulate: function(response, options) {
			
			// set the default options
			var defaults = {
				fieldName: "FIELDNAME",
				fieldValue: "FIELDVALUE"
			};
			
			var options = $.extend(defaults, options);
			
			// create references to the options
			var fieldName = options.fieldName;
			var fieldValue = options.fieldValue;
			
		
			// create a reference to the object
			var dataObj = {};

			// Iteratation Type
			
			if ($.isArray( response )){	// json - array of structures  --  alert('isArray of structures');
																																				
				// loop over the response data (structures)																				
				for (var i = 0; i < response.length; i++) {
					
					// loop over each item within the specific response item
					$.each(response[i], function(key,value){
						dataObj[ key.toLowerCase() ] = value;
					});
					
					// multiple length indicate name/value pairs such as "fieldName" and "fieldValue" - create new value from existing dataObj values
					if ( response.length > 1 && fieldName != '' && fieldValue != ''){
						dataObj[ dataObj[fieldName.toLowerCase()].toLowerCase() ] = dataObj[ fieldValue.toLowerCase() ];
					}
				}
			} else if ('ROWCOUNT' in response) {	// JSON - serializeJSON(response, true) - WDDX-compatible format  --  alert('is json WDDX compat format');
			
				// loop over the response data (rows)																				
				for (var i = 0; i < response.ROWCOUNT; i++) {
					
					// loop over the DATA to create the data collection as column-value pairs
					$.each(
						response.DATA,
						function( column, values ){
							dataObj[ column.toLowerCase() ] = values[i];
						}
					)
					
					// multiple rows indicate name/value pairs such as "fieldName" and "fieldValue" - create new value from existing dataObj values
					if ( response.ROWCOUNT > 1 && fieldName != '' && fieldValue != ''){	
						dataObj[ dataObj[fieldName.toLowerCase()].toLowerCase() ] = dataObj[ fieldValue.toLowerCase() ];
					}
				}															
			} else if ('COLUMNS' in response) {	// json - serializeJSON(response)  --  alert('is json query format');
			
				//map columns to names
				var columnMap = {};
				
				for (var i = 0; i < response.COLUMNS.length; i++) {
					columnMap[response.COLUMNS[i].toLowerCase()] = i	
				}			

				// loop over the response data (rows)																				
				for (var i = 0; i < response.DATA.length; i++) {
					
					// loop over the column names to create the data collection as column-value pairs
					$.each(
						response.COLUMNS,
						function( index, column ){
							dataObj[ column.toLowerCase() ] = response.DATA[i][columnMap[ column.toLowerCase() ]];
						}
					)
					
					// multiple rows indicate name/value pairs such as "fieldName" and "fieldValue" - create new value from existing dataObj values
					if ( response.DATA.length > 1 && fieldName != '' && fieldValue != ''){
						dataObj[response.DATA[i][columnMap[fieldName.toLowerCase()]].toLowerCase()] = response.DATA[i][columnMap[fieldValue.toLowerCase()]];	
					}
				}
			} else {	// unknown format  --  alert('unknown json format');
				//console.dir(response);
			}
											
			
			// POPULATE FORM - Loop through inputs and assign each HTML tag the appropriate value
			$(this).find(':input').each(function(index, element) {
				
				// set variable
				var $fieldID = $(this);
				
				// output all element types to console:  console.log(element.type);
					
				// as we loop over each input, ensure we have a value for it in the dataObj, otherwise skip
				if ( dataObj[$fieldID.attr('id').toLowerCase()] != null ||  dataObj[$fieldID.attr('name').toLowerCase()] != null) {
										
					switch(element.type || element.tagName)
					{
						case 'radio':
							//alert('is radio');
							
							// default element checked to false
							element.checked = false;
							
							// check if there is a valid value to check the radio button 						
							//if (dataObj[$fieldID.attr('id').toLowerCase()])
							element.checked = (element.value != '' && dataObj[$fieldID.attr('id').toLowerCase()] == element.value );
							
							// if not checked via ID  try via name
							if (!$fieldID.is(':checked')){
								element.checked = (element.value != '' && dataObj[$fieldID.attr('name').toLowerCase()] == element.value );
							}
							
							
							// set the label value for pretty checkboxes
							$label = $('label[for="'+$fieldID.attr('id')+'"]');
							
							// default pretty checkboxes label to false
							$label.removeClass('checked');
							
							// check if there is a valid value to add the class to label
							if($fieldID.is(':checked')) { $label.addClass('checked'); };
							
							
							break;
						case 'checkbox':
							//alert('is checkbox');
							
							// default element checked to false
							element.checked = false;
							
							// check if there is a valid value to check the radio button 						
							//if (dataObj[$fieldID.attr('id').toLowerCase()])
							element.checked = (element.value != '' && dataObj[$fieldID.attr('id').toLowerCase()] == element.value );
							
							// if not checked via ID  try via name
							if (!$fieldID.is(':checked')){
								element.checked = (element.value != '' && dataObj[$fieldID.attr('name').toLowerCase()] == element.value );
							}
							
							
							// set the label value for pretty checkboxes
							$label = $('label[for="'+$fieldID.attr('id')+'"]');
							
							// default pretty checkboxes label to false
							$label.removeClass('checked');
							
							// check if there is a valid value to add the class to label
							if($fieldID.is(':checked')) { $label.addClass('checked'); };
							
							break;
						case 'select-one':
							//alert('is select-one');
							
							// set the typeof (string, number, etc) for the preselected options
							var thisType = (typeof(dataObj[$fieldID.attr('id').toLowerCase()]));
							
							if (thisType == 'number'){
								//console.log('preselect options are a number, cannot use split');
								var vals = dataObj[$fieldID.attr('id').toLowerCase()];
							}
							else if (thisType == 'string') {
								//console.log('preselect options are a string and can be split');
								// map the values to be preselected in the multiple select input					
								var vals = $.map(dataObj[$fieldID.attr('id').toLowerCase()].split(','), function(e){
									return e;
									// instead of return e you could do an additional split of values such as
									// return e.split("^")[0];  -- e.g. values of ( 4^CO,5^CA,6^DE )
								});
							} else {
								//console.log('preselect options are neither string or number so skip')
								var vals = '';
							}	
							
							// preselect the selected options
							$('#' + $fieldID.attr('id')).val(vals);
														
							// PLUGIN (chosen) - refresh to reflect updated selections
							$('#' + $fieldID.attr('id')).trigger("liszt:updated");
							
							break;
						case 'select-multiple':
							//alert('is select-multiple');
														
							// set the typeof (string, number, etc) for the preselected options
							var thisType = (typeof(dataObj[$fieldID.attr('id').toLowerCase()]));
							
							if (thisType == 'number'){
								//console.log('preselect options are a number, cannot use split');
								var vals = dataObj[$fieldID.attr('id').toLowerCase()];
							}
							else if (thisType == 'string') {
								//console.log('preselect options are a string and can be split');
								// map the values to be preselected in the multiple select input					
								var vals = $.map(dataObj[$fieldID.attr('id').toLowerCase()].split(','), function(e){
									return e;
									// instead of return e you could do an additional split of values such as
									// return e.split("^")[0];  -- e.g. values of ( 4^CO,5^CA,6^DE )
								});
							} else {
								//console.log('preselect options are neither string or number so skip')
								var vals = '';
							}	
							
							// preselect the selected options
							$('#' + $fieldID.attr('id')).val(vals);
							
							// PLUGIN (chosen) - refresh to reflect updated selections
							$('#' + $fieldID.attr('id')).trigger("liszt:updated");
							
							break;
						case 'text':
							//alert('is text');
							$fieldID.val(dataObj[$fieldID.attr('id').toLowerCase()] );
							break;
						case 'textarea':
							//alert('is textarea');
							
							$fieldID.val(dataObj[$fieldID.attr('id').toLowerCase()] );
							
							// if ckEditor exists populate it
							var instanceName = $fieldID.attr('id');
							
							// if CKEDITOR does not exist throws error, therefore try catch							
							try {
									if (CKEDITOR.instances[instanceName]){
									CKEDITOR.instances[instanceName].setData( dataObj[$fieldID.attr('id').toLowerCase()] );
									}		
							} catch(e) {
								//alert('no ckeditor exits');
							}
													
							break;
						case 'password':
							//alert('is password');
							$fieldID.val(dataObj[$fieldID.attr('id').toLowerCase()] );
							break;
						case 'file':
							//alert('this is file');
							//file input is a security feature in all modern browsers - val() will not work
							break;	
						case 'button':
							//alert('is button');
							//$fieldID.val(dataObj[$fieldID.attr('id').toLowerCase()] );
							break;
						case 'submit':
							//alert('is submit');
							//$fieldID.val(dataObj[$fieldID.attr('id').toLowerCase()] );
							break;
						case 'reset':
							//alert('is reset');
							//$fieldID.val(dataObj[$fieldID.attr('id').toLowerCase()] );
							break;
						case 'search':
							//alert('this is search');
							//$fieldID.val(dataObj[$fieldID.attr('id').toLowerCase()] );
							break;
						default:
							if (dataObj[$fieldID.attr('id').toLowerCase()])
							$fieldID.val(dataObj[$fieldID.attr('id').toLowerCase()] );
							break;
					}
			
				} 



					
			});				
			
		}		// end - cfeoPopulate: function()
	});			// end - $.fn.extend
})(jQuery);