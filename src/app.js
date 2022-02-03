'use strict';

const express = require('express');
const {dialogflow, SignIn, SimpleResponse, BasicCard, Image} = require('actions-on-google');
const axios = require('axios');
const moment = require('moment');
moment.locale('fr');
const consoimg = require('./consoimg');

const app = express();
app.use(express.json())

const dialogflowApp = dialogflow();
dialogflowApp.fallback(wtf);
dialogflowApp.intent('Welcome', getMobileConso);
dialogflowApp.intent('conso-data', getMobileConso);
dialogflowApp.intent('ask_for_sign_in_confirmation', signInCompleted);

function wtf(conv) {
    return conv.ask("Je n'ai pas compris. Répétez s'il vous plaît.");
}

function getMobileConso(conv) {
    if (conv.user && conv.user.access && conv.user.access.token) {
        const params = {
            url: 'https://api.bouyguestelecom.fr/customer-management/v1/usage-consumptions/mobile-data',
            method: 'get',
            headers: {Authorization: `Bearer ${conv.user.access.token}`},
            timeout: 4500,
            responseType: 'json'
        };

        return axios(params)
            .then(function (response) {
                let consommation = response.data.usages[0];
                let totalConsommation = 0;
                let limitConsommation = 0;
                if (!consommation.mainDataUsage) {
                    return conv.close(new SimpleResponse({
                        speech: `votre ligne n'a pas été trouvée`,
                        text: `votre ligne n'a pas été trouvée`
                    }));
                }
                if (consommation.mainDataUsage) {
                    limitConsommation += consommation.mainDataUsage.limitBytes;
                    totalConsommation += consommation.mainDataUsage.usageBytes;
                }
                if (consommation.additionnalDataUsage) {
                    totalConsommation += consommation.additionnalDataUsage.usageBytes;
                }
                if (consommation.rechargeDataUsage) {
                    totalConsommation += consommation.rechargeDataUsage.usageBytes;
                }
                const quantiteTotale = consoimg.formatBytes(limitConsommation);
                if (totalConsommation === 0) {
                    return conv.close(new SimpleResponse({
                        speech: `Vous n'avez rien consommé de votre forfait de ${quantiteTotale.speech}`,
                        text: `Vous n'avez rien consommé de votre forfait de ${quantiteTotale.text}`
                    }));
                }
                const quantiteConsommee = consoimg.formatBytes(totalConsommation);
                const remainingDataRatio = (limitConsommation - totalConsommation) / limitConsommation;
                let dateReinitialisation = moment();
                if (consommation.mainDataUsage.renewDate) {
                    dateReinitialisation = moment(consommation.mainDataUsage.renewDate);
                }
                const remainingTimeRatio = dateReinitialisation.diff(moment()) / moment.duration({months: 1}).asMilliseconds();
                let speech;
                let text;
                if (remainingDataRatio < remainingTimeRatio) {
                    speech = `Vous avez déjà consommé ${quantiteConsommee.speech} sur ${quantiteTotale.speech} disponible jusqu'au ${dateReinitialisation.format('D MMMM')}`;
                    text = `Vous avez déjà consommé ${quantiteConsommee.text} sur ${quantiteTotale.text} disponible jusqu'au ${dateReinitialisation.format('D MMMM')}`;
                } else {
                    speech = `Vous avez consommé ${quantiteConsommee.speech} sur ${quantiteTotale.speech}`;
                    text = `Vous avez consommé ${quantiteConsommee.text} sur ${quantiteTotale.text}`;
                }
                const imageName = consoimg.consoImage(totalConsommation, limitConsommation);
                return conv.close(new SimpleResponse({speech: speech, text: text}), new BasicCard({
                    title: '0' + consommation.phoneNumber.substring(3),
                    subtitle: `Prochain renouvellement: ${dateReinitialisation.format('D MMMM')}`,
                    image: new Image({
                        url: `https://static.consodata.labinno.fr/${imageName}`,
                        alt: quantiteConsommee.text
                    })
                }));
            })
            .catch(function (err) {
                console.log(err);
                return conv.close(`Désolé, je n'y arrive pas`);
            });
    } else {
        // Intent that starts the account linking flow
        return conv.ask(new SignIn('Vous devez vous authentifier'));
    }
}

function signInCompleted(conv, params, signin) {
    if (signin.status !== 'OK') {
        return conv.ask(new SignIn('Vous devez vraiment vous authentifier pour que je puisse vous répondre'));
    } else {
        return getMobileConso(conv);
    }
}

app.get("/", (req, res) => {
    res.send("Up and running");
});
app.post('/webhook', dialogflowApp);

app.listen(80, () => {
    console.log("consodata webhook running on port 80");
});