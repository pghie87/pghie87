import static com.kms.katalon.core.checkpoint.CheckpointFactory.findCheckpoint
import static com.kms.katalon.core.testcase.TestCaseFactory.findTestCase
import static com.kms.katalon.core.testdata.TestDataFactory.findTestData
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import static com.kms.katalon.core.testobject.ObjectRepository.findWindowsObject
import com.kms.katalon.core.checkpoint.Checkpoint as Checkpoint
import com.kms.katalon.core.cucumber.keyword.CucumberBuiltinKeywords as CucumberKW
import com.kms.katalon.core.mobile.keyword.MobileBuiltInKeywords as Mobile
import com.kms.katalon.core.model.FailureHandling as FailureHandling
import com.kms.katalon.core.testcase.TestCase as TestCase
import com.kms.katalon.core.testdata.TestData as TestData
import com.kms.katalon.core.testng.keyword.TestNGBuiltinKeywords as TestNGKW
import com.kms.katalon.core.testobject.TestObject as TestObject
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import com.kms.katalon.core.windows.keyword.WindowsBuiltinKeywords as Windows
import internal.GlobalVariable as GlobalVariable
import org.openqa.selenium.Keys as Keys

// Call Login test case first
WebUI.callTestCase(findTestCase('Login_Test_Case'), ['username': 'Admin', 'password': 'admin123'], FailureHandling.STOP_ON_FAILURE)

// Verify Dashboard elements
WebUI.verifyElementText(findTestObject('Object Repository/Page_OrangeHRM/h6_Dashboard'), expectedTitle)

// Verify Quick Launch section is present
WebUI.verifyElementPresent(findTestObject('Object Repository/Page_OrangeHRM/div_Quick_Launch'), 5)

// Verify Time at Work widget is present
WebUI.verifyElementPresent(findTestObject('Object Repository/Page_OrangeHRM/div_Time_at_Work'), 5)

// Verify My Actions widget is present
WebUI.verifyElementPresent(findTestObject('Object Repository/Page_OrangeHRM/div_My_Actions'), 5)

// Verify main menu items are present
WebUI.verifyElementPresent(findTestObject('Object Repository/Page_OrangeHRM/a_Admin'), 5)
WebUI.verifyElementPresent(findTestObject('Object Repository/Page_OrangeHRM/a_PIM'), 5)
WebUI.verifyElementPresent(findTestObject('Object Repository/Page_OrangeHRM/a_Leave'), 5)
WebUI.verifyElementPresent(findTestObject('Object Repository/Page_OrangeHRM/a_Time'), 5)
WebUI.verifyElementPresent(findTestObject('Object Repository/Page_OrangeHRM/a_Recruitment'), 5)

// Take screenshot of dashboard page
WebUI.takeScreenshot('dashboard_verification.png')

WebUI.comment('Dashboard verification completed successfully')