
$(document).ready(function() { 
    renderBill();
 });

$('#download-report').click(function () {
    // downloadPdf(pdfDocument);
    openPdf(pdfDocument);
});

$('#test-report').click(function () {
    var pdfContext = generatePdfContext();
    pdfDocument = buildPdf(pdfContext);
    openPdf(pdfDocument);
});

function sendPdfToEmail(receiver){
    var pdfDocGenerator = pdfMake.createPdf(pdfDocument);
    var pdfDocObj = pdfDocGenerator.getBase64((data) => {
    });
    pdfDocObj.then(function(result) {
        sendEmail(result, receiver);
   });
}
async function uploadFile(pdfDoc) {
	// var fileContent = 'Hello World'; // As a sample, upload a text file.
    var fileContent = pdfMake.createPdf(pdfDoc);
	// var file = new Blob([fileContent], { type: 'text/plain' });
    var file = new Blob([fileContent], { type: 'application/octetstream' });
    
	var metadata = {
		'name': 'sample-file-via-js', // Filename at Google Drive
		'mimeType': 'application/octetstream', // mimeType at Google Drive
		// TODO [Optional]: Set the below credentials
		// Note: remove this parameter, if no target is needed
		'parents': ['1Av9rul-em5omaFixJM-LDOgOjVF7PLra'], // Folder ID at Google Drive which is optional
	};

	var accessToken = gapi.auth.getToken().access_token; // Here gapi is used for retrieving the access token.
	var form = new FormData();
	form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
	form.append('file', file);

	var xhr = new XMLHttpRequest();
	xhr.open('post', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id');
	xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
	xhr.responseType = 'json';
	xhr.onload = () => {
		document.getElementById('content').innerHTML = "File uploaded successfully. The Google Drive file id is <b>" + xhr.response.id + "</b>";
		document.getElementById('content').style.display = 'block';
	};
	xhr.send(form);
}

function updateBillVars(productTotalSum, productTotalQuantity, totalPrice){
    // id and entry
    var productSumEle = document.getElementById("ff-id-2046362136");
    // var productTotalQuantityEle =  document.getElementById("ff-id-2139224654");
    // var totalPriceEle =  document.getElementById("ff-id-2139224654");


    // productSumEle.value = productTotalSum;
    // productTotalQuantityEle.value = productTotalQuantity;
    // totalPriceEle.value = totalPrice;

    // display
    var displayProductSum = document.getElementById("Display2046362136");
    var displayQuantity = document.getElementById("Display2139224654");
    var displayTotal = document.getElementById("Display1588677463");

    displayProductSum.value = productTotalSum;
    displayQuantity.value = productTotalQuantity;
    displayTotal.value = totalPrice;

    productSumEle.value = productTotalSum;


}

function calculateProduct(){
    // 周邊總價
    var sum = 0;
    var quantity = 0;
    var sumEle = document.getElementById("ff-id-2046362136");
    var displayProductSum = document.getElementById("Display2046362136");
    var displayQuantity = document.getElementById("Display2139224654");
    var displayTotal = document.getElementById("Display1588677463");
    
    // list
    var listEle = document.getElementById("ff-id-1959728480");
    for (var property in product_data){
        var obj = product_data[property];
        if(obj.quantity){
            sum += obj.quantity * obj.price;
            quantity += obj.quantity;
        }
    }
    displayProductSum.value = sum;
    displayTotal.value = sum + 1125;
    sumEle.value = sum;
    displayQuantity.value = quantity;


}

function getDocument() {
    return document;
}

function renderBill(){
    var table = document.getElementById('bill-table-1959728480');
    table.body = null;
    header = ` <colgroup>
                <col>
                <col>
                <col>
                <col>
            </colgroup>
            <thead>
                <tr>
                <td>項目</td>
                <td>單價</td>
                <td>數量</td>
                <td>總價</td>
                </tr>
            </thead><tbody>`;
        
    var allRows = [];
    for (var property in product_data){
        var obj = product_data[property];
        if(obj.quantity){
            var amount = obj.quantity * obj.price;
            var row = '<tr>'+
            '<td>'+obj.title+'</td>'+
            '<td>'+obj.price+'</td>'+
            '<td>'+obj.quantity+'</td>'+
            '<td>'+amount+'</td>'+
            '</tr>';
            allRows.push(row);
        }
    }
    
    var productPrice = document.getElementById("ff-id-2046362136").value;
    var registerFee = 1125;
    var finalPrice = (productPrice ? productPrice : 0) + registerFee;
    
    // var footer = document.getElementById('table-footer');
    var footer = `<tfoot>
        <tr>
            <td colspan="3">周邊總價</td>
            <td>NT$${productPrice ? productPrice: 0}</td>
        </tr>
        <tr>
            <td colspan="3">茶會報名費</td>
            <td>NT$${registerFee}</td>
        </tr>
        <tr>
            <td colspan="3">最終價錢</td>
            <td>NT$${finalPrice}</td>
        </tr> </tfoot>`;
    table.innerHTML = header + allRows.join(' ') + "</tbody>"+footer;


}

function getNextSectionId(secid) {
    var sections = getSectionsItems();
    var idx = sections.findIndex(sec => sec.id == secid);
    var nxt = sections[idx + 1];
    if (nxt) return nxt.id;
    return secid;
}

function getPreviousSectionId(secid) {
    var sections = getSectionsItems();
    var idx = sections.findIndex(sec => sec.id == secid);
    var prev = sections[idx - 1];
    if (prev) return prev.id;
    return secid;
}

function jumptoSection(frm, secid, deftrg, trg, wid) {

    var sections = getSectionsItems();
    sections.forEach(section=>{
        var id = 'ff-sec-'+section.id;
        var sectionDiv = document.getElementById(id);
        if(section.id===trg){
            sectionDiv.style.display = "block";
        }else{
            sectionDiv.style.display = "none";
        }
    })
}

function endSection() {
    var sections = getSectionsItems();
    sections.forEach(section=>{
        var id = 'ff-sec-'+section.id;
        var sectionDiv = document.getElementById(id);
        if(section.id==="ending"){
            sectionDiv.style.display = "block";
        }else{
            sectionDiv.remove();
        }
    })
}

function pdfHeader(title){
    return  { 
        alignment: 'center',
        text: `Report #${title}`,
        style: 'header',
        fontSize: 23,
        bold: true,
        margin: [0, 10],
    }
}

function generatePdfSentence(title, content){
    return {
		italics: false,
		text: [
			{text: " - " + title + "：\n", style: 'itemTitle', bold: true},
			{text: "   " + content+ "\n", style: 'itemContext', bold: false},
			'\n'
		]
	}

}

function generateUlItem(key, value){
    return {
		italics: false,
		ul: [
            {text: key+ "\n"},
            [
                {
                    text:  value+ "\n"
                },
            ]
        ],
        text:  [{text: value+ "\n"}],
	}

}

function generateSection(title, content){
    return {
		italics: false,
		text: [
			{text: title + "\n", style: 'h4', bold: true},
			{text: content+ "\n", style: 'p'},
			'\n'
		]
	}
}
function getBillData(){
    var refreshTable = [];
    var productPrice = 0;
    for (var property in product_data){
        var obj = product_data[property];
        if(obj.quantity){
            var amount = obj.quantity * obj.price;
            productPrice += amount;
            refreshTable.push({'項目': obj.title, '單價':obj.price, '數量':obj.quantity, '總價': amount })
        }
    }
    return {
        billData: refreshTable,
        total: productPrice,
    };
}

function buildPdf(context) {
    pdfMake.fonts = {
        Roboto: {
          normal: 'Roboto-Regular.ttf',
          bold: 'Roboto-Medium.ttf',
          italics: 'Roboto-Italic.ttf',
          bolditalics: 'Roboto-Italic.ttf'
        },
        AaGuDianKeBenSong: {
          normal: 'AaGuDianKeBenSong.ttf',
          bold: 'AaGuDianKeBenSong.ttf',
          italics: 'AaGuDianKeBenSong.ttf',
          bolditalics: 'AaGuDianKeBenSong.ttf'
        },
         characters: {
            normal: 'characters.ttf',
            bold: 'characters.ttf',
            italics: 'characters.ttf',
            bolditalics: 'characters.ttf'
         },
          
      };
    var docDefinition = {
      info: {
        title: 'Report',
        author: 'One And Only One',
        subject: 'MobRei wedding Register Form',
        keywords: 'MobRei Wedding',
    },
      content: context,
      defaultStyle: {
        font: 'characters',
        fontSize: 11,
        color: '#595553',
        lineHeight: 1.2,
      },
      styles: {
        header: {
          fontSize: 18,
          bold: true
        },
        itemTitle: {
          fontSize: 12,
        },
        itemContext:{
          color: '#595553'
        },
        "p": {
          "marginTop": 11
        },
        "ul": {
          "marginTop": 11
        },
        "ol": {
          "marginTop": 11
        },
        "h1": {
          "marginTop": 36,
          "fontSize": 36
        },
        "h2": {
          "fontSize": 24,
          "marginTop": 10
        },
        "h3": {
          "fontSize": 20,
          "bold": true,
          "italics": true,
          "marginTop": 10
        },
        "h4": {
            "fontSize": 15,
            "bold": true,
            "marginTop": 10
          }
      }
      
      
  };
  return docDefinition;
    // pdfMake.createPdf(docDefinition).open();
}

function openPdf(pdfDoc){
    pdfMake.createPdf(pdfDoc).open();
}

function downloadPdf(pdfDoc){
    pdfMake.createPdf(pdfDoc).download('report.pdf');
}
function generatePdfContext(){
    var emailEntry = document.getElementById('Widget658159440').value;
    var nameEntry = document.getElementById('Widget1439048663').value;
    var digit3Entry = document.getElementById('Widget981692748').value;
    var allergyEntry = document.getElementById('Widget1043102370').value;
    var emergencyEntry = document.getElementById('Widget1827994924').value;
    
    var preference = function() {
        var v;
        $('[name="entry.18356239"]').each(function() {
            if($(this).prop('checked') === true) v = $(this).val();
        });
        return v;
    };
    var preferenceEntry = preference();

    var withFriendsEntry = document.getElementById('Widget1226046570').value;
    var questionOrThoughts = document.getElementById('Widget1388002876').value;
    var toTheTeam = document.getElementById('Widget1496947901').value;

    // get bill data
    var orderData = getBillData()
    var billTable = buildPdfTable(orderData, bill_col_data);
    var context = [
        pdfHeader(emailEntry), 
        generatePdfSentence('名字', nameEntry), 
        generatePdfSentence('信箱', emailEntry), 
        generatePdfSentence('手機末三碼', digit3Entry), 
        generatePdfSentence('有無對食物過敏', allergyEntry), 
        generatePdfSentence('緊急聯絡人', emergencyEntry), 
        generatePdfSentence('希望多與摳色互動嗎？', preferenceEntry), 
        generatePdfSentence('有希望被分配在同桌的親友嗎？', withFriendsEntry), 
        generatePdfSentence('對婚禮的期待或者想提的問題？', questionOrThoughts), 
        generatePdfSentence('給籌備組的話', toTheTeam), 
        generateSection('您的購買明細如下：', ''), 
        billTable];
    return context;
}

function buildPdfTableBody(data, columns) {
    var body = [];
    var styledColumns = columns.map(column=>{
        return {
            borderColor: ['#ffffff', '#ffffff', '#ffffff', '#b0aeae'],
            text: column,
        }
    })

    body.push(styledColumns);
    // columns.push(...data);
    var details = data.billData;
    var productPrice = data.total;
    details.forEach(function(row) {
        var dataRow = [];

        columns.forEach(function(column) {
            var cell = {
                borderColor: ['#ffffff', '#ffffff', '#ffffff', '#b0aeae'],
                fontSize: 9,
                text: row[column],
            }

            dataRow.push(cell);
        })

        body.push(dataRow);
    });
    var row = [
        {text: '',
        border: [false, false, false, false]}, {text: '',
        border: [false, false, false, false]}, {text: '',
        border: [false, false, false, false]}, {text: '',
        border: [false, false, false, false]}
    ]
    var row1 = [
        {
            text: '周邊總價',
            border: [false, false, false, false],
            colSpan: 3,
            fontSize: 11,
            bold: true
        }, 
        { 
        },
        {
        },
        {
            text: 'NT$ '+productPrice.toString(),
            border: [false, false, false, false],
            fontSize: 11,
            bold: true
        }
    ];
    var row2 = [
        {
            text: '報名費',
            border: [false, false, false, false],
            colSpan: 3,
            fontSize: 11,
            bold: true
        }, 
        { 
        },
        {
        },
        {
            text: 'NT$ 1125',
            border: [false, false, false, false],
            fontSize: 11,
            bold: true
        }
    ];
    var finalPrice = productPrice + 1125;
    var row3 = [
        {
            text: '總費用',
            border: [false, false, false, false],
            colSpan: 3,
            fontSize: 11,
            bold: true
        }, 
        { 
        },
        {
        },
        {
            text: 'NT$ ' + finalPrice.toString(),
            border: [false, false, false, false],
            fontSize: 11,
            bold: true
        }
    ];
    body.push(row);
    body.push(row1);
    body.push(row2);
    body.push(row3);

    return body;
}

function buildPdfTable(data, columns) {
    return {
        style: 'tableStyle',
        layout: {
            // fillColor: function (rowIndex, node, columnIndex) {
            //     return (rowIndex === 0) ? '#c2dec2' : null;
            // },
            // hLineColor: function (i, node) {
            //     return (i === 0) ? 'white' : 'white';
            // // },
            // hLineColor: 'white',
            // vLineColor: 'white',
        },
        table: {
            widths: ['25%', '25%', '25%', '25%'],
            heights: 20, 
            headerRows: 1,
            body: buildPdfTableBody(data, columns)
        }
    };
}

function getSectionsItems(){
    return [
        {
            "id": "root",
            "items":[
            {
                // name
                "id": "1439048663",
                "type": "",
                "entryType": "text",
                "entryId": "1068526554",
            },
            {
                // email
                "id": "658159440",
                "entryType": "text",
                "entryId": "883070371",
                "regex": "^(.+)@(.+)$",
                "errorMsg": "請再確認一次信箱格式～"
                
            },
            {
                // 3 digits
                "id": "981692748",
                "entryType": "text",
                "entryId": "1053365713",
                "regex": "^[0-9]{3}$",
                "errorMsg": "格式為三位半形數字喔～"
                
            },
            {
                // addr
                "id": "1686927898",
                "entryType": "text",
                "entryId": "896231682",
                
            },
            {
                // addr receiver
                "id": "1691582630",
                "entryType": "text",
                "entryId": "111610196",
                
            },
            {
                // allergy
                "id": "1043102370",
                "type": "PARAGRAPH_TEXT",
                "entryType": "text",
                "entryId": "1395581871"
                
            },
            {
                // emergency contact
                "id": "1827994924",
                "type": "PARAGRAPH_TEXT",
                "entryType": "text",
                "entryId": "1970291756"
            },
            {
                // 1125
                "id": "929329530",
                "entryType": "radio",
                "entryId": "1841292804"
            },
            {
                // little helper
                "id": "36699560",
                "entryType": "radio",
                "entryId": "1339607071"
            },
            {
                // payment method
                "id": "895429393",
                "entryType": "radio",
                "entryId": "451787920"
            },
            {
                // display title
                "id": "1624480621",
                "entryType": ""
            },
            {
                // product
                "id": "1406572988",
                "entryType": "custom",
            }, 
            {
                // product
                "id": "259046852",
                "entryType": "custom",
            }, 
            {
                // product
                "id": "304960959",
                "entryType": "custom",
            }, 
            {
                // product
                "id": "2051996369",
                "entryType": "custom",
            }, 
            {
                // product
                "id": "1706597056",
                "entryType": "custom",
            }, 
            {
                // product
                "id": "901430140",
                "entryType": "custom",
            }, 
            {
                // display: 文字
                "id": "985712023",
                "entryType": ""
            }, 
            {   //product
                "id": "1121831062",
                "entryType": "custom",
            }, 
            {
                // display: product total price
                "id": "2046362136",
                "entryType": "bill-display",
                "entryId": "575052231"
            }, 
            {
               // display: product total quantity
                "id": "2139224654",
                "entryType": "bill-display",
                "entryId": "253014823"
            }, 
            {
                // display: register fee
                "id": "855092565",
                "entryType": "",
                "entryId": "1423911485"
            }, 
            {
                // display: sum 
                "id": "1588677463",
                "entryType": "bill-display",
                "entryId": "1725694623"
            }, 
            {
                // display: bill
                "id": "1959728480",
                "entryType": ""
            },]
        },
        {
            "id": "1194002809",
            "items":[ 
            {
                // I/E 
                "id": "218713257",
                "entryType": "radio",
                "entryId": "18356239"
            }, 
            {
                // rule: no food
                "id": "964519823",
                "entryType": "radio",
                "entryId": "1286001326"
            }, 
            {
                // with friends
                "id": "1226046570",
                "entryType": "text",
                "entryId": "1032881495"
            }, 
            {
                 // rule: with cosers
                "id": "368266770",
                "entryType": "radio",
                "entryId": "746776974"
            }, 
            {
                 // mobrei doll
                "id": "957187906",
                "entryType": "radio",
                "entryId": "450550785"
            }, 
            {
                // bring ID cards
               "id": "1565424873",
               "entryType": "radio",
               "entryId": "63787071"
              }, 
            {
                // information done
                "id": "1666827740",
                "entryType": "radio",
                "entryId": "1160286542"
            }, 
            {   
                // note: Q or thoughts
                "id": "1388002876",
                "entryType": "text",
                "entryId": "653167275"
            }, 
            {
                // note: to the team
                "id": "1496947901",
                "entryType": "text",
                "entryId": "713268329"
            }]
         },
         {
             "id": "ending",
             "items":[]
          }
        
    ]
}

function getData(){
  var sections = getSectionsItems();
  dataSet = {};
  sections.forEach(section=>{
    var items = section.items;
    items.forEach(item=>{
        var name = "entry." + item.entryId;
        var value = "";
        if(item.entryType=="radio"){
            var checkeVal = function() {
                var v;
                $(`[name="${name}"]`).each(function() {
                    if($(this).prop('checked') === true) v = $(this).val();
                });
                return v;
                };
            value = checkeVal();
        }else if(item.entryType=="custom"){
            value = product_data[item.id].quantity;
            name = product_data[item.id].quantity_id
            
        }else if(item.entryType=="bill-display"){
            value = $(`#Display${item.id}`).val() || 0;
        }
        else {
            value = $(`[name="${name}"]`).val() || '';
        }
        dataSet[name] = value;

    })
  })
  dataSet['pageHistory'] = '0,1';
  return dataSet;
}

function submitForm(frm, secid, callback) {
    var invalids = secid == '-3' ? 0 : validate(frm, secid);
    if (invalids > 0) return;
    if (this.submitting) return;
    var test_data = {
        'entry.1068526554': '7. Oct',
        'entry.883070371': 'again tester@gmail',
        'entry.1053365713': '123',
        'entry.1395581871': 'what',
        'entry.1970291756': 'OK',
        'entry.1841292804': '沒問題！',
        'entry.451787920': '銀行轉帳',
        'entry.918817329': '2',
        'entry.1230811956': '2',
        'entry.1122819681': '2',
        'entry.1946631460': '2',
        'entry.1036346855': '1',
        'entry.1797326934': '2',
        'entry.347979567': '2',
        'entry.575052231': '5386',
        'entry.253014823': '13',
        'entry.1423911485': '1125',
        'entry.1725694623': '6511',
        'entry.18356239': '非常希望！！很期待在ST的帶領下完美體驗沈浸式婚禮',
        'entry.1286001326': '知道了！',
        'entry.746776974': '知道了！',
        'entry.450550785': '當然啦！！！',
        'entry.1160286542': 'OFC，聰明絕頂的我',
        "entry.1032881495": "maomaouaauuaau",
        "entry.653167275": "please be healthy",
        'pageHistory': '0,1'
      }
    
    var pdfContext = generatePdfContext();
    pdfDocument = buildPdf(pdfContext);

    $.ajax({
        type: 'POST',
        url: 'https://docs.google.com/forms/d/e/1FAIpQLSdfsLWjzLUKRZRxsUbiJNuverhidV76_VuR3GK2YFr_pkxiNw/formResponse',
        data: getData(),
        contentType: 'application/json',
        dataType: 'jsonp',
        complete: function() {
            alert('資料已送出！');
            endSection();
        }
    });

    return false;
}

function scrollIntoView(elm) {
    if (!elm) elm = this.getContentElement() || {};
    if (elm.scrollIntoView) {
        elm.scrollIntoView(true);
        // var scrolledY = window.scrollY;
        // window.scroll(0, scrolledY-80);
    }
}

function validate(frm, secid) {
    var curr = this;
    var invalids = [];
    var doc = getDocument();
    var frmdata = new FormData(frm);
    var sections = getSectionsItems();
    var section = sections[0];
    sections.forEach(function (sec, s) {
        if (sec.id == secid)
            section = sec;
    });
    doc.querySelectorAll('#ff-sec-' + section.id + ' .ff-widget-error').forEach(function (widerr) {
        widerr.style.display = 'none';
    });
    var emlwid = doc.getElementById('WidgetemailAddress');
    if (emlwid && emlwid.checkValidity() == false) {
        var widerr = doc.getElementById('ErroremailAddress');
        if (emlwid.value)
            widerr.innerHTML = '<b>!</b>' + curr.lang('Must be a valid email address');
        else
            widerr.innerHTML = '<b>!</b>' + curr.lang('This is a required question');
        widerr.style.display = 'block';
        invalids.push(emlwid);
    }
    section.items.forEach(function (itm, i) {
        var widinp = doc.querySelector('#ff-id-' + itm.id + ' input');
        if (itm.type == 'PARAGRAPH_TEXT')
            widinp = doc.querySelector('#ff-id-' + itm.id + ' textarea');
        else if (itm.type == 'LIST') {
            widinp = doc.querySelector('#ff-id-' + itm.id + ' select');
            if (!widinp)
                widinp = doc.querySelector('#ff-id-' + itm.id + ' input');
        }
        var reportError = function (msg) {
            invalids.push(widinp);
            var widerr = doc.getElementById('Error' + itm.id);
            if (widerr) {
                widerr.innerHTML = '<b>!</b>' + msg;
                widerr.style.display = 'block';
            }
        }
        var envalue;
    
        var valid = true;
        if (widinp) {
            if (widinp.readOnly) {
                widinp.readOnly = false;
                valid = widinp.checkValidity();
                widinp.readOnly = true;
            }
            else
                valid = widinp.checkValidity();
            envalue = frmdata.get(widinp.name);
            
            // check custom regex
            if(envalue && itm.regex){
                var regex = new RegExp(`${itm.regex}`);
                valid = regex.test(envalue);
            }
            
        }
        // name = entry.1068526554
        // id = Widget1439048663
        if (valid == false) {
            if (widinp.hasAttribute('required') && !envalue) {
                // reportError(curr.lang('This is a required question'));
                reportError('這是必填問題喔！');
            }
            else if (envalue) {
                if (itm.errorMsg){
                    // reportError(curr.lang('Must be a valid email address'));
                    reportError(itm.errorMsg);
                }
                else{
                    reportError('格式錯誤');
                }
            }
            else {
                reportError('好像有東西出錯了');
            }
        }
        else if (widinp && widinp.list && envalue && itm.choices) {
            var matches = itm.choices.filter(ch => ch.value == envalue.trim());
            if (matches.length == 0) reportError(curr.lang('Invalid answer. Clear & select a valid answer from the list'));
        }
        else {
            if (curr.data && curr.data.facade && curr.data.facade.items)
                itm.overwrite = curr.data.facade.items[itm.id];
            validateEngine(itm, frmdata, reportError);
        }
    });
    if (invalids.length > 0) {
        invalids[0].focus();
        scrollIntoView(invalids[0]);
    }
    return invalids.length;
}

function gotoSection(frm = {}, secid, deftrg) {
    var doc = this.getDocument();
    var trg;
    if (deftrg == 'back') {
        trg = getPreviousSectionId(secid);
        jumptoSection(frm, secid, deftrg, trg);
    }
    else {
        this.saveDraft();
       
        var invalids = validate(frm, secid);
       
        if (invalids > 0) return;
        trg = deftrg ? deftrg : getNextSectionId(secid);
        var items = this.data?.scraped.items || {};
        doc.querySelectorAll('#ff-sec-' + secid + ' .ff-nav-dyn').forEach(function (wid = {}, w) {
            var navs = [];
            var fid = wid.id ? wid.id.split('-').pop() : null;
            var itm = items[fid] || {};
            var enval = frm['entry.' + itm.entry] || {};
            if (itm.choices) navs = itm.choices.filter(ch => ch.value == enval.value);
            if (navs.length > 0) trg = navs[0].navigateTo;
        });
        if (trg == -1)
            trg = secid;
        else if (trg == -2)
            trg = getNextSectionId(secid);
        else if (trg == -3)
            trg = 'ending';
    }
    jumptoSection(frm, secid, deftrg, trg);
}

function updateProduct(enid, val, close) {
    product_data[enid].quantity = val ? val: 0;
    
    if (enid) {
        if (val){
            draft.entry[enid] = val;
        }
        else{
            delete draft.entry[enid];
        }
           
    }
    calculateProduct();
    renderBill();
    if (close)
    {
        this.renderProduct(enid, val);
        this.closePopup(enid, val);
    }
    else
    {
        this.renderProduct(enid, val);
    }
       
}

this.saveDraft = function() {
}


this.closePopup = function (render = true) {
    document.body.style.overflowY = 'auto';
    var overlay = document.getElementById('ff-addprd-overlay');
    overlay.classList.remove('active');
    var popup = document.getElementById('ff-addprd-popup');
    popup.classList.remove('active');
    popup.classList.remove('ff-consent-confirm');
    // setTimeout(function () {
    //     if (render) formFacade.render();
    // }, 10);
}

this.renderProduct = function (enid, val) {
    var id = "ff-id-" + enid;
    var ele = document.getElementById(id);
    if(!val){
        if (ele.lastElementChild.classList.contains("ff-sel-cart")){
            ele.removeChild(ele.lastChild);
        }
    }else{
        var changedNode = `<div onclick="showProduct(${enid})" class="ff-sel-cart">
        <div class="ff-sel-cart-sm">x <b>${val}</b></div>
      </div>`;
        if (ele.lastElementChild.classList.contains("ff-sel-cart")){
            ele.removeChild(ele.lastChild);
            ele.lastElementChild = changedNode;
        }
        ele.innerHTML += changedNode;
        
    }
}


function generateProductInnterHtml(product){
    var itemList = ""
    for(var i=1; i< 10; i++){
        var item = "";
       
        if (draft.entry[product.product_id] && draft.entry[product.product_id] == i){
            item =  `<li class="col-qty-active" onclick="updateProduct(${product.product_id}, ${i}, true)" title="${i}" id="prdentry.${product.product_id}">
                     ${i}
                 </li>`;
        }else{
            item =  `<li onclick="updateProduct(${product.product_id}, ${i}, true)" title="${i}" id="prdentry.${product.product_id}">
            ${i} </li>`;
        }
        itemList += item;
    }
    var footer = '';
    if (draft.entry[product.product_id]){
        footer = `
    <div class="prdfooter">
			<a class="prddel" href="#!" onclick="updateProduct(${product.product_id}, null, true)">清空</a>
		</div>`;
    }
    var header = `     
    <div class="prdheader">
	<div class="prdtitle">${product.title}</div>
	<div class="prdhelp">
		
			NT$${product.price}
	</div>
    
	<div class="prdclose" onclick="closePopup(false)">
		<span class="material-icons">close</span>
	</div>
</div>
	
<div>
	
<div class="prdwdg">
        <div class="col-qty">
        
            <label>請選擇數量</label>
        
          <ul>
            ${itemList}
          </ul>
    </div>
</div>
${footer}

</div>`
  return header;
}

function  showProduct(iid) {
    var curr = this;
    this.product = { id: iid };
    var item = product_data[iid];
    if (item && item.type == 'PARAGRAPH_TEXT') {
        var val = this.draft.entry ? this.draft.entry[item.entry] : null;
        this.product.configurable = this.toConfigurable(val);
    }
    var overlay = document.getElementById('ff-addprd-overlay');
    overlay.classList.add('active');
    var popup = document.getElementById('ff-addprd-popup');
    popup.classList.add('active');
    popup.innerHTML = generateProductInnterHtml(item);
    document.body.style.overflowY = 'hidden';

}


function validateEngine(itm, frmdata, reportError) {
    var curr = this;
    var txtval = frmdata.get('entry.' + itm.entry);
    if (!itm.validType && itm.overwrite && itm.overwrite.validation && itm.overwrite.validation.validType) {
        Object.assign(itm, itm.overwrite.validation);
    }
    if (itm.type == 'CHECKBOX') {
        var valarr = frmdata.getAll('entry.' + itm.entry);
        var valothr = frmdata.get('entry.' + itm.entry + '.other_option_response');
        var validothr = valothr ? !valothr.trim() : true;
        var validop = itm.validOperator;
        var validval = itm.validValue;
        if (isNaN(validval) == false)
            validval = parseInt(validval);
        var validmsg = itm.validMessage;
        if (itm.required && valarr.length == 0) {
            reportError(curr.lang('This is a required question'));
        }
        else if (itm.required && valarr.length == 1 && valarr[0] == '__other_option__' && validothr) {
            reportError(curr.lang('This is a required question'));
        }
        else if (validop == 'Atmost' && valarr.length > validval) {
            if (!validmsg) validmsg = 'Must select at most ' + validval + ' options';
            reportError(validmsg);
        }
        else if (validop == 'Atleast' && valarr.length < validval) {
            if (!validmsg) validmsg = 'Must select at least ' + validval + ' options';
            reportError(validmsg);
        }
        else if (validop == 'Exactly' && valarr.length != validval) {
            if (!validmsg) validmsg = 'Must select exactly ' + validval + ' options';
            reportError(validmsg);
        }
    }
    else if (itm.type == 'MULTIPLE_CHOICE') {
        var valothr = frmdata.get('entry.' + itm.entry + '.other_option_response');
        var validothr = valothr ? !valothr.trim() : true;
        if (itm.required && txtval == '__other_option__' && validothr) {
            reportError(curr.lang('This is a required question'));
        }
    }
    else if (itm.type == 'GRID') {
        if (itm.required) {
            itm.rows.forEach(function (rw, r) {
                var valarr = frmdata.getAll('entry.' + rw.entry);
                if (valarr.length == 0) {
                    validmsg = 'This question requires one response per row';
                    if (rw.multiple == 1)
                        validmsg = 'This question requires at least one response per row';
                    validmsg = curr.lang(validmsg);
                    reportError(validmsg);
                }
            });
        }
        if (itm.onepercol) {
            var rwvals = {};
            itm.rows.forEach(function (rw, r) {
                frmdata.getAll('entry.' + rw.entry).forEach(function (rwval) {
                    if (rwvals[rwval]) {
                        validmsg = 'Please don\'t select more than one response per column';
                        validmsg = curr.lang(validmsg);
                        reportError(validmsg);
                    }
                    rwvals[rwval] = rw.entry;
                });
            });
        }
    }
    else if (itm.overwrite && itm.overwrite.type == 'FILE_UPLOAD') {
        var fileval = frmdata.get('entry.' + itm.entry);
        var validmsg = itm.validMessage;
        if (itm.required && !fileval) {
            if (!validmsg) validmsg = curr.lang('This is a required question');
            reportError(validmsg);
        }
    }
    else if (txtval && (itm.type == 'TEXT' || itm.type == 'PARAGRAPH_TEXT')) {
        var validtyp = itm.validType;
        var validop = itm.validOperator;
        var validmsg = itm.validMessage;
        if (itm.validDynamic && itm.validEntryId) {
            var compTxtVal = frmdata.get('entry.' + itm.validEntryId);
            if (validtyp == 'Number') {
                var compFltval; var fltval;
                if (isNaN(compTxtVal) == false)
                    compFltval = parseFloat(compTxtVal);
                if (isNaN(txtval) == false)
                    fltval = parseFloat(txtval);
                if (isNaN(txtval))
                    enmsg = 'Must be a number';
                else if (!compTxtVal || isNaN(compTxtVal))
                    enmsg = 'Comparison field must be a number';
                else if (validop == 'GreaterThan' && fltval > compFltval == false)
                    enmsg = 'Must be a number greater than ' + compFltval;
                else if (validop == 'GreaterEqual' && fltval >= compFltval == false)
                    enmsg = 'Must be a number greater than or equal to ' + compFltval;
                else if (validop == 'LessThan' && fltval < compFltval == false)
                    enmsg = 'Must be a number less than ' + compFltval;
                else if (validop == 'LessEqual' && fltval <= compFltval == false)
                    enmsg = 'Must be a number less than or equal to ' + compFltval;
                else if (validop == 'EqualTo' && fltval != compFltval)
                    enmsg = 'Must be a number equal to ' + compFltval;
                else if (validop == 'NotEqualTo' && fltval == compFltval)
                    enmsg = 'Must be a number not equal to ' + compFltval;
                if (enmsg) {
                    reportError(validmsg ? validmsg : enmsg);
                }
            } else if (validtyp == 'Text') {
                var enmsg;
                var compTxtVal = frmdata.get('entry.' + itm.validEntryId);
                if (validop == 'EqualTo' && txtval != compTxtVal)
                    enmsg = 'Must equal to ' + itm.validValue;
                else if (validop == 'NotEqualTo' && txtval == compTxtVal)
                    enmsg = 'Must not equal to ' + itm.validValue;
                if (enmsg) {
                    reportError(validmsg ? validmsg : enmsg);
                }

            }
        } else if (validtyp == 'Number') {
            var enmsg;
            if (!itm.validValue)
                itm.validValue = 0;
            var fltval;
            if (isNaN(txtval) == false)
                fltval = parseFloat(txtval);
            var validval = itm.validValue;
            if (isNaN(validval) == false)
                validval = parseFloat(validval);
            if (isNaN(txtval))
                enmsg = 'Must be a number';
            else if (validop == 'IsNumber' && isNaN(txtval))
                enmsg = 'Must be a number';
            else if (validop == 'WholeNumber' && (isNaN(txtval) || txtval.indexOf('.') >= 0))
                enmsg = 'Must be a whole number';
            else if (validop == 'GreaterThan' && fltval > validval == false)
                enmsg = 'Must be a number greater than ' + validval;
            else if (validop == 'GreaterEqual' && fltval >= validval == false)
                enmsg = 'Must be a number greater than or equal to ' + validval;
            else if (validop == 'LessThan' && fltval < validval == false)
                enmsg = 'Must be a number less than ' + validval;
            else if (validop == 'LessEqual' && fltval <= validval == false)
                enmsg = 'Must be a number less than or equal to ' + validval;
            else if (validop == 'EqualTo' && fltval != validval)
                enmsg = 'Must be a number equal to ' + validval;
            else if (validop == 'NotEqualTo' && fltval == validval)
                enmsg = 'Must be a number not equal to ' + validval;
            else if (validop == 'Between' && itm.validValue2 && (fltval < validval || fltval > parseFloat(itm.validValue2)))
                enmsg = 'Must be a number between ' + itm.validValue + ' and ' + itm.validValue2;
            else if (validop == 'NotBetween' && itm.validValue2 && (fltval >= validval && fltval <= parseFloat(itm.validValue2)))
                enmsg = 'Must be a number less than ' + itm.validValue + ' or greater than ' + itm.validValue2;

            if (enmsg) {
                reportError(validmsg ? validmsg : enmsg);
            }
        }
        else if (validtyp == 'Text') {
            var enmsg;
            if (validop == 'EqualTo' && txtval != itm.validValue)
                enmsg = 'Must equal to ' + itm.validValue;
            else if (validop == 'NotEqualTo' && txtval == itm.validValue)
                enmsg = 'Must not equal to ' + itm.validValue;
            else if (validop == 'Contains' && itm.validValue && (txtval.indexOf(itm.validValue) >= 0) == false)
                enmsg = 'Must contain ' + itm.validValue;
            else if (validop == 'NotContains' && itm.validValue && (txtval.indexOf(itm.validValue) >= 0))
                enmsg = 'Must not contain ' + itm.validValue;
            else if (validop == 'Email' && /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63}$/.test(txtval) == false)
                enmsg = 'Must be an email';
            else if (validop == 'URL' && /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/.test(txtval) == false)
                enmsg = 'Must be a URL';
            if (enmsg) {
                reportError(validmsg ? validmsg : enmsg);
            }
        }
        else if (itm.validValue && validtyp == 'Regex') {
            var enmsg;
            if (!txtval) txtval = '';
            var regx = new RegExp(itm.validValue, 'g');
            if (validop == 'Contains' && regx.test(txtval) == false)
                enmsg = 'Must contain ' + itm.validValue;
            else if (validop == 'NotContains' && regx.test(txtval))
                enmsg = 'Must not contain ' + itm.validValue;
            else if (validop == 'Matches') {
                var mtrs = txtval.match(regx);
                var validmt = mtrs && mtrs.length == 1 && mtrs[0] == txtval;
                if (!validmt) enmsg = 'Must match ' + itm.validValue;
            }
            else if (validop == 'NotMatches' && txtval.match(regx)) {
                var mtrs = txtval.match(regx);
                var validmt = mtrs && mtrs.length == 1 && mtrs[0] == txtval;
                if (validmt) enmsg = 'Must not match ' + itm.validValue;
            }
            if (enmsg) {
                reportError(validmsg ? validmsg : enmsg);
            }
        }
        else if (validtyp == 'Length') {
            var enmsg;
            if (!itm.validValue)
                itm.validValue = 0;
            if (validop == 'MaxChar' && txtval.length > parseInt(itm.validValue))
                enmsg = 'Must be fewer than ' + itm.validValue + ' characters';
            else if (validop == 'MinChar' && txtval.length < parseInt(itm.validValue))
                enmsg = 'Must be at least ' + itm.validValue + ' characters';
            if (enmsg) {
                reportError(validmsg ? validmsg : enmsg);
            }
        }
    }
}
