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

/**
 * Verify dashboard elements after login
 * @author Senior QA Engineer
 */

// First call the login test case to ensure user is logged in
WebUI.callTestCase(findTestCase('Login_TC'), ['username':'Admin', 'password':'admin123'], FailureHandling.STOP_ON_FAILURE)

// Verify dashboard title
WebUI.verifyElementText(findTestObject('Object Repository/Dashboard_Page/h6_Dashboard'), 'Dashboard')

// Verify dashboard widgets are present
WebUI.verifyElementPresent(findTestObject('Object Repository/Dashboard_Page/div_Time_at_Work'), 10)
WebUI.verifyElementPresent(findTestObject('Object Repository/Dashboard_Page/div_My_Actions'), 10)
WebUI.verifyElementPresent(findTestObject('Object Repository/Dashboard_Page/div_Quick_Launch'), 10)
WebUI.verifyElementPresent(findTestObject('Object Repository/Dashboard_Page/div_Buzz_Latest_Posts'), 10)

// Verify navigation menu elements
WebUI.verifyElementPresent(findTestObject('Object Repository/Dashboard_Page/a_Admin'), 10)
WebUI.verifyElementPresent(findTestObject('Object Repository/Dashboard_Page/a_PIM'), 10)
WebUI.verifyElementPresent(findTestObject('Object Repository/Dashboard_Page/a_Leave'), 10)
WebUI.verifyElementPresent(findTestObject('Object Repository/Dashboard_Page/a_Time'), 10)
WebUI.verifyElementPresent(findTestObject('Object Repository/Dashboard_Page/a_Recruitment'), 10)
WebUI.verifyElementPresent(findTestObject('Object Repository/Dashboard_Page/a_My_Info'), 10)

// Verify user dropdown is present
WebUI.verifyElementPresent(findTestObject('Object Repository/Dashboard_Page/span_User_Dropdown'), 10)

// Take screenshot of dashboard
WebUI.takeScreenshot('Screenshots/dashboard_verification.png')

WebUI.comment('Dashboard verification completed successfully')