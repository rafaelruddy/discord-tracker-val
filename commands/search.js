const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const axios = require('axios');
const cheerio = require("cheerio");
const classConfig = require("../config.json")
module.exports = {
	data: new SlashCommandBuilder()
		.setName('search')
		.setDescription('Search for an user on Tracker.gg!')
		.addStringOption(option =>
			option.setName('user')
				.setRequired(true)
				.setDescription('User pattern: ruddy#2222')
		),

	async execute(interaction) {

		const args = interaction.options.get('user').value.split('#');

		const url = `https://tracker.gg/valorant/profile/riot/${args[0]}%23${args[1]}/overview?playlist=competitive&season=all`;

		

		try {
			await axios.get(url)
			.then(async (response) => {

				const $ = cheerio.load(response.data);

				const gstats = $("div .giant-stats .value")
				const gtatsContent = ["Damage/Round", "K/D", "Headshot", "Win"]
				const gtatsValues = []

				gstats.each((idx,el) => {
					// console.log($(el).text());
					gtatsValues.push($(el).text())
				})



				const main = $("div .main .value")
				const mainContent = ["Wins","Kast","Damage Dealt / Round","Kills","Deaths","Assists","Score/Round","KAD Ratio","Kills/Round","Clutches","Flawless"]
				const mainValues = []

				main.each((idx,el) => {
					mainValues.push($(el).text())
				})

				const avatar = $('div .ph-avatar img').attr('src')
				const rank = $('.trn-profile-highlighted-content__icon').attr('src')
				

				// console.log(mainValues)
				const embed = new EmbedBuilder()
					.setColor("Blurple")
					.setTitle(`Competitive Overview for ${interaction.options.get('user').value}.` + `\n\u200b`)
					.setImage(rank)
					.setTimestamp()
					

				gtatsContent.forEach((value,index) => {
					embed.addFields({name:value, value: gtatsValues[index], inline: true})
				})

				mainContent.forEach((value,index) => {
					embed.addFields({name:value, value: mainValues[index], inline: true})
				})

				const row = new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder()
							.setLabel('Profile URL')
							.setURL(`${url}`)
							.setStyle(5)	
					);

				interaction.reply({embeds: [embed], components: [row]});

			})
			.catch((error) => {
				if (error.response.status == 404)
					return interaction.reply(`Não foi possivel encontrar o usuario ${interaction.options.get('user').value}`);

				return console.error(error)
			});
			 
		} catch (err) {
			console.error(err);
		}

	},
};
