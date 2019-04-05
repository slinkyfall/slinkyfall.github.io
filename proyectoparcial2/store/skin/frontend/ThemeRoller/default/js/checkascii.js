var START_ASCII_CODE = [1,31] ;

var END_ASCII_CODE   = [30,382];

function CheckAsciiValues(obj)
{
	var isValidText  = true;
	var resultText   = '';

	var srcval = obj.value;
		srcval = srcval ? srcval : '';

	if (srcval.length == 0)
		return;

	for (q=0; q<srcval.length; q++)
	{
		var  keyval = srcval.charCodeAt(q);
		var  isValidChar = false;

		for (i=0; i<START_ASCII_CODE.length; i++)
			isValidChar = isValidChar || (keyval>=START_ASCII_CODE[i] && keyval<=END_ASCII_CODE[i]);

		isValidText = isValidText && isValidChar;

		if  (isValidChar)
			resultText += String.fromCharCode(keyval);

	}

	obj.value = resultText;

	if (!isValidText) {
		tempswapcolor = obj.style.borderColor;
		tempswapwidth = obj.style.borderWidth;
		obj.style.border = "3px solid red";
		errorMsg = document.getElementById('char-messagge').value;
		alert(errorMsg);
		obj.style.borderColor = tempswapcolor;
		obj.style.borderWidth = tempswapwidth;
	}

}

function mask(str,textbox,loc,delim){
  var locs = loc.split(','); 
  for (var i = 0; i <= locs.length; i++)
  {
    for (var k = 0; k <= str.length; k++)
    {
      if (k == locs[i])
      {
        if (str.substring(k, k+1) != delim)
        {
          str = str.substring(0,k) + delim + str.substring(k,str.length)
        }
      }
    }
  }
  textbox.value = str
}

function CheckNumericValues(obj, posTrat, qtaNum, msgErr)
{
	var isValidText  = true;
	var resultText   = '';
	var qtaChar = 0;
	var qtaNumInStr = 0;

	var srcval = obj.value;
		srcval = srcval ? srcval : '';

	if (srcval.length == 0)
		return;
	var  keyval = '';
	var  isValidChar = false;

	for (q=0; q<srcval.length; q++)
	{
		keyval = srcval.charCodeAt(q);
		isValidChar = false;

		isValidChar = isValidChar || (keyval>47 && keyval<58) || ((keyval==45) && q==posTrat); //(keyval>95 && keyval<106) || 
		//if (!isValidChar) alert(keyval);
		if (keyval>47 && keyval<58)
		{
		  qtaNumInStr += 1;
		}

		isValidText = isValidText && isValidChar;

		if  (isValidChar)
		  {
			resultText += String.fromCharCode(keyval);
			qtaChar += 1;
			}
		else
		  {
      resultText += '';
      }
	}
	if (qtaNumInStr == 0)
	{
	  resultText = '';
	}
	if (!isValidText || (qtaNumInStr<posTrat))
	{
	  resultText=replace(resultText,'-','');
	  if(resultText.length>posTrat)
	  {
	    resultText= resultText.substring(0,posTrat) + '-' + resultText.substring(posTrat,resultText.length) 
	  }
	}

	obj.value = resultText;

	if (!isValidText) {
		tempswapcolor = obj.style.borderColor;
		tempswapwidth = obj.style.borderWidth;
		obj.style.border = "3px solid red";
		errorMsg = document.getElementById('char-messagge').value;
		alert(errorMsg);
		obj.style.borderColor = tempswapcolor;
		obj.style.borderWidth = tempswapwidth;
	}
	else
	{
	  if (qtaChar != qtaNum) 
	  {
		  tempswapcolor = obj.style.borderColor;
		  tempswapwidth = obj.style.borderWidth;
		  obj.style.border = "3px solid red";
		  alert(msgErr);
		  obj.style.borderColor = tempswapcolor;
		  obj.style.borderWidth = tempswapwidth;
	  }
	}

}

function replace(fullString,text,by) {
// Replaces text with by in string
    var strLength = fullString.length, txtLength = text.length;
    if ((strLength == 0) || (txtLength == 0)) return fullString;

    var i = fullString.indexOf(text);
    if ((!i) && (text != fullString.substring(0,txtLength))) return fullString;
    if (i == -1) return fullString;

    var newstr = fullString.substring(0,i) + by;

    if (i+txtLength < strLength)
        newstr += replace(fullString.substring(i+txtLength,strLength),text,by);

    return newstr;
}