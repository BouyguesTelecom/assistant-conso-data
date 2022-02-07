// URL: https://us-central1-bytel-conso-data.cloudfunctions.net/dialogflowFirebaseFulfillment
// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs 
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const functions = require('firebase-functions');
const { dialogflow, SignIn, SimpleResponse } = require('actions-on-google');
const axios = require('axios');
const moment = require('moment');

const app = dialogflow({ debug: false });

app.intent('Welcome', getMobileConso);
app.intent('conso-data', getMobileConso);
app.intent('ask_for_sign_in_confirmation', signInCompleted);

function formatBytes(bytes, decimals) {
    if (bytes === 0) {
        return {text: '0 octets', speech: 'zero'};
    } else {
        const k = 1024,
            dm = decimals || 2,
            sizes = ['Octets', 'Ko', 'Mo', 'Go', 'To', 'Po', 'Eo', 'Zo', 'Yo'],
            speechSizes = ['Octets', 'Kilo octets', 'Mega octets', 'Giga octets', 'Tera octets', 'Péta octets', 'Exa octets', 'Zetta octets', 'Yotta octets'],
            i = Math.floor(Math.log(bytes) / Math.log(k));
        const sizeInUnit = (bytes / Math.pow(k, i)).toLocaleString('fr', {maximumFractionDigits: dm});
        return {
            text: sizeInUnit + ' ' + sizes[i],
            speech: sizeInUnit.replace('.', ',') + ' ' + speechSizes[i]
        };
    }
}


function getMobileConso(conv) {
	if (conv.user && conv.user.access && conv.user.access.token) {
		var params = {
			url: 'https://api.bouyguestelecom.fr/customer-management/v1/usage-consumptions/mobile-data',
			method: 'get',
			headers: { Authorization: `Bearer ${conv.user.access.token}` },
			responseType: 'json'
		};

		return axios(params)
      		.then(function (response) {
          			let consommation = response.data.usages[0];
					let totalConsommation = 0;
         			let limitConsommation = 0;
          			if (!consommation.mainDataUsage){
                      return conv.close(new SimpleResponse({speech: `votre ligne n'a pas été trouvée`, text: `votre ligne n'a pas été trouvée`}));
                    }
          			if (consommation.mainDataUsage && consommation.mainDataUsage.limitBytes) {
                      limitConsommation += consommation.mainDataUsage.limitBytes;
                    }
                  	if (consommation.mainDataUsage) {
                      	totalConsommation += consommation.mainDataUsage.usageBytes;
                    }
                    if (consommation.additionnalDataUsage) {
                      	totalConsommation += consommation.additionnalDataUsage.usageBytes;
                    }
                    if (consommation.rechargeDataUsage) {
                      	totalConsommation += consommation.rechargeDataUsage.usageBytes;
                    }
                //logger.log('verbose', 'conso mobile for contrat', bytelInfo.idContrat, ':', JSON.stringify(consoMobile));
                const quantiteConsommee = formatBytes(totalConsommation);
                const quantiteTotale = formatBytes(limitConsommation);
                const remainingDataRatio = (limitConsommation - totalConsommation) / limitConsommation;
                let dateReinitialisation = 0;
                console.warn(consommation);
          		if (consommation.mainDataUsage.renewDate) {
					dateReinitialisation = moment(consommation.mainDataUsage.renewDate);
                }
		        const remainingTimeRatio = dateReinitialisation.diff(moment()) / moment.duration({months: 1}).asMilliseconds();
                //logger.log('verbose', 'dateReinitialisation', consoMobile.dateReinitialisation, 'remainingDataRatio', remainingDataRatio.toFixed(2), 'remainingTimeRatio', remainingTimeRatio.toFixed(2));
                let speech;
                let text;
                if (remainingDataRatio < remainingTimeRatio) {
                    speech = `Vous avez déjà consommé ${quantiteConsommee.speech} sur ${quantiteTotale.speech} disponible jusqu'au ${dateReinitialisation.format('D MMMM')}`;
                    text = `Vous avez déjà consommé ${quantiteConsommee.text} sur ${quantiteTotale.text} disponible jusqu'au ${dateReinitialisation.format('D MMMM')}`;
                } else {
                    speech = `Vous avez consommé ${quantiteConsommee.speech} sur ${quantiteTotale.speech}`;
                    text = `Vous avez consommé ${quantiteConsommee.text} sur ${quantiteTotale.text}`;
                }
                return conv.close(new SimpleResponse({speech: speech, text: text}));
            })
			.catch(function (err) {
                console.log(err);
                console.log(err.response.data);
				conv.close(`Désolé, je n'y arrive pas`);
			});
	} else {
      // Intent that starts the account linking flow
      conv.ask(new SignIn('Vous devez vous authentifier'));
	}
}

function signInCompleted(conv, params, signin) {
    if (signin.status !== 'OK') {
      	return conv.ask(new SignIn('Vous devez vraiment vous authentifier pour que je puisse vous répondre'));
    } else {
    	return getMobileConso(conv);
    }
}

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);