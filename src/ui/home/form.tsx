import React, {useContext, useEffect, useState} from "react";
import {Text, StyleSheet, View, RefreshControl} from "react-native";
import {getAssessmentForm, postAssessmentForm} from "src/network/basics";
import {Form, Person} from "src/models/home/assessment";
import Snackbar from "react-native-snackbar";
import {getStr} from "src/utils/i18n";
import {
	TextInput,
	ScrollView,
	TouchableOpacity,
} from "react-native-gesture-handler";
import {StarRating} from "src/components/home/form";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import {ThemeContext} from "../../assets/themes/context";
import themes from "../../assets/themes/themes";
import {FormRouteProp, HomeNav} from "./homeStack";

export const FormScreen = ({
	route,
	navigation,
}: {
	route: FormRouteProp;
	navigation: HomeNav;
}) => {
	const url: string = route.params.url;

	const themeName = useContext(ThemeContext);
	const theme = themes[themeName];

	const [refreshing, setRefreshing] = useState(true);
	const [evaluationForm, setEvaluationForm] = useState<Form>();
	// TODO: 'useState' may not be the best choice.

	const fetchForm = (_url: string) => {
		setRefreshing(true);
		getAssessmentForm(_url)
			.then((res: Form) => {
				setEvaluationForm(res);
				setRefreshing(false);
			})
			.catch(() => {
				Snackbar.show({
					text: getStr("networkRetry"),
					duration: Snackbar.LENGTH_SHORT,
				});
				setRefreshing(false);
			});
	};

	const renderEvaluation = (personList: Person[], personType: string) => {
		let evaluationList = [];
		if (personList.length !== 0) {
			personList.forEach((person, i) => {
				evaluationList.push(
					<Text style={styles.personNameStyle} key={`Teacher${i}Name`}>
						{person.name}
					</Text>,
				);

				person.inputGroups.forEach((inputGroup, j) => {
					evaluationList.push(
						<View style={styles.questionStyle} key={`Person${i}Question${j}`}>
							<Text style={styles.questionTextStyle}>
								{inputGroup.question ?? ""}
							</Text>
							<StarRating scoreRef={inputGroup.score} />
						</View>,
					);
				});

				evaluationList.push(
					<View key={`Person${i}Suggestion`}>
						<Text style={styles.textInputCaptionStyle}>
							{personType === "teacher"
								? getStr("moreSuggestionsToTeacher")
								: getStr("moreSuggestionsToAssistant")}
						</Text>
						<TextInput
							style={styles.textInputStyle}
							multiline={true}
							placeholder={getStr("inputSuggestions")}
							defaultValue={
								(personType === "teacher"
									? evaluationForm?.teachers[i]?.suggestion
									: evaluationForm?.assistants[i]?.suggestion) ?? ""
							}
							onChangeText={(text) => {
								if (evaluationForm) {
									if (personType === "teacher") {
										evaluationForm.teachers[i].suggestion = text;
									} else {
										evaluationForm.assistants[i].suggestion = text;
									}
								}
							}}
						/>
					</View>,
				);
			});
		} else {
			evaluationList.push(
				<Text style={styles.captionStyle} key="stupidEvaluationWebsite">
					{getStr("noPersonToEvaluate")}
				</Text>,
			);
		}
		return <View>{evaluationList}</View>;
	};

	const post = () => {
		setRefreshing(true);
		if (evaluationForm !== undefined) {
			const invalid = evaluationForm.invalid();
			if (invalid) {
				Snackbar.show({
					text: invalid,
					duration: Snackbar.LENGTH_LONG,
				});
				setRefreshing(false);
			} else {
				postAssessmentForm(evaluationForm)
					.then(() => {
						Snackbar.show({
							text: getStr("postSuccess"),
							duration: Snackbar.LENGTH_SHORT,
						});
						setRefreshing(false);
						navigation.pop();
					})
					.catch(() => {
						Snackbar.show({
							text: getStr("postFailure"),
							duration: Snackbar.LENGTH_SHORT,
						});
						setRefreshing(false);
					});
			}
		}
	};

	useEffect(() => fetchForm(url), [url]);

	return (
		<ScrollView
			style={styles.container}
			showsVerticalScrollIndicator={false}
			refreshControl={
				<RefreshControl
					refreshing={refreshing}
					colors={[theme.colors.accent]}
				/>
			}>
			<View style={styles.titleContainer}>
				<FontAwesome name="chevron-right" color="red" size={18} />
				<Text style={styles.titleStyle}>{getStr("generalImpression")}</Text>
			</View>
			{evaluationForm && <StarRating scoreRef={evaluationForm.overall.score} />}
			<Text style={styles.textInputCaptionStyle}>
				{getStr("moreSuggestionsToCourse")}
			</Text>
			<TextInput
				style={styles.textInputStyle}
				multiline={true}
				placeholder={getStr("inputSuggestions")}
				defaultValue={evaluationForm?.overall?.suggestion ?? ""}
				onChangeText={(text) => {
					if (evaluationForm) {
						evaluationForm.overall.suggestion = text;
					}
				}}
			/>
			<View style={styles.titleContainer}>
				<FontAwesome name="chevron-right" color="green" size={18} />
				<Text style={styles.titleStyle}>{getStr("teacherEvaluation")}</Text>
			</View>
			{evaluationForm && renderEvaluation(evaluationForm.teachers, "teacher")}
			<View style={styles.titleContainer}>
				<FontAwesome name="chevron-right" color="blue" size={18} />
				<Text style={styles.titleStyle}>{getStr("assistantEvaluation")}</Text>
			</View>
			{evaluationForm &&
				renderEvaluation(evaluationForm.assistants, "assistant")}
			<TouchableOpacity
				style={[
					styles.buttonStyle,
					{
						backgroundColor:
							evaluationForm === undefined ? "lightgrey" : theme.colors.primary,
					},
				]}
				onPress={post}
				disabled={evaluationForm === undefined}>
				<Text style={styles.buttonTextStyle}>{getStr("post")}</Text>
			</TouchableOpacity>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginHorizontal: 17,
	},

	titleContainer: {
		flexDirection: "row",
		alignContent: "center",
		justifyContent: "flex-start",
		alignItems: "center",
		marginBottom: 10,
		marginTop: 15,
	},

	titleStyle: {
		fontWeight: "bold",
		fontSize: 18,
		marginHorizontal: 5,
	},

	textInputCaptionStyle: {
		alignSelf: "flex-start",
		marginTop: 20,
		marginBottom: 10,
	},

	textInputStyle: {
		height: 80,
		backgroundColor: "white",
		textAlign: "left",
		borderColor: "lightgrey",
		borderWidth: 1,
		borderRadius: 5,
		alignSelf: "stretch",
		textAlignVertical: "top",
		padding: 10,
		marginBottom: 20,
	},

	personNameStyle: {
		fontSize: 18,
		alignSelf: "center",
		marginVertical: 15,
		fontWeight: "bold",
	},

	questionStyle: {
		marginVertical: 3,
	},

	questionTextStyle: {
		marginVertical: 2,
	},

	captionStyle: {
		alignSelf: "center",
		marginVertical: 5,
	},

	buttonStyle: {
		height: 35,
		width: 100,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 8,
		alignSelf: "center",
		marginVertical: 10,
	},

	buttonTextStyle: {
		color: "white",
		fontWeight: "bold",
	},
});
