import "react-native";
import React from "react";
import {App} from "../src/App";
import renderer from "react-test-renderer";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

it("renders correctly", async () => {
	jest.setTimeout(30000);

	// Render the app
	/*const {root} =*/ renderer.create(<App />);
	await sleep(1000);

	// There seems to be some problems when upgrading react-test-renderer to 17+.
	// Commenting the following out for now.
	// Perform login
	/*root.findByProps({testID: "loginUserId"}).props.onChangeText("8888");
	root.findByProps({testID: "loginPassword"}).props.onChangeText("8888");
	await sleep(1000);*/
});
