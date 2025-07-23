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

// Open browser and navigate to the Orange HRM login page
WebUI.openBrowser('')
WebUI.maximizeWindow()
WebUI.navigateToUrl('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login')

// Wait for the page to load
WebUI.waitForElementPresent(findTestObject('Page_OrangeHRM_Login/input_Username'), 10)

// Log the test case being executed
WebUI.comment("Executing Login with Valid Credentials test case")

// Enter username
WebUI.setText(findTestObject('Page_OrangeHRM_Login/input_Username'), username)

// Enter password
WebUI.setEncryptedText(findTestObject('Page_OrangeHRM_Login/input_Password'), password)

// Click login button
WebUI.click(findTestObject('Page_OrangeHRM_Login/button_Login'))

// Verify successful login by checking if dashboard is displayed
WebUI.waitForElementPresent(findTestObject('Page_OrangeHRM_Dashboard/h6_Dashboard'), 10)
WebUI.verifyElementPresent(findTestObject('Page_OrangeHRM_Dashboard/h6_Dashboard'), 5)
WebUI.verifyElementText(findTestObject('Page_OrangeHRM_Dashboard/h6_Dashboard'), 'Dashboard')

// Take screenshot of the dashboard
WebUI.takeScreenshot('Dashboard_Screenshot.png')

// Logout
WebUI.click(findTestObject('Page_OrangeHRM_Common/dropdown_UserProfile'))
WebUI.waitForElementClickable(findTestObject('Page_OrangeHRM_Common/link_Logout'), 5)
WebUI.click(findTestObject('Page_OrangeHRM_Common/link_Logout'))

// Verify user is logged out and back at login page
WebUI.waitForElementPresent(findTestObject('Page_OrangeHRM_Login/input_Username'), 10)

// Close browser
WebUI.closeBrowser()