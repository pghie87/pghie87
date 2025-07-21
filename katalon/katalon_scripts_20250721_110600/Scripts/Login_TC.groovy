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
 * Login to Orange HRM demo site with valid credentials
 * @author Senior QA Engineer
 */

// Open the browser and navigate to the login page
WebUI.openBrowser('')
WebUI.navigateToUrl('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login')

// Wait for the page to load
WebUI.waitForElementVisible(findTestObject('Object Repository/Login_Page/input_Username'), 10)

// Input credentials
WebUI.setText(findTestObject('Object Repository/Login_Page/input_Username'), username)
WebUI.setText(findTestObject('Object Repository/Login_Page/input_Password'), password)

// Click login button
WebUI.click(findTestObject('Object Repository/Login_Page/button_Login'))

// Verify successful login by checking dashboard is displayed
WebUI.waitForElementVisible(findTestObject('Object Repository/Dashboard_Page/h6_Dashboard'), 10)
WebUI.verifyElementPresent(findTestObject('Object Repository/Dashboard_Page/h6_Dashboard'), 10)

// Take screenshot of successful login
WebUI.takeScreenshot('Screenshots/successful_login.png')

// Log successful login
WebUI.comment('Successfully logged in to Orange HRM with username: ' + username)