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

// Open browser and navigate to the OrangeHRM login page
WebUI.openBrowser('')
WebUI.maximizeWindow()
WebUI.navigateToUrl('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login')

// Wait for page to load
WebUI.waitForElementPresent(findTestObject('Object Repository/Page_Login/input_Username'), 30)

// Enter username and password
WebUI.setText(findTestObject('Object Repository/Page_Login/input_Username'), username)
WebUI.setText(findTestObject('Object Repository/Page_Login/input_Password'), password)

// Click login button
WebUI.click(findTestObject('Object Repository/Page_Login/button_Login'))

// Verify successful login by checking dashboard elements
WebUI.waitForElementPresent(findTestObject('Object Repository/Page_Dashboard/h6_Dashboard'), 30)
WebUI.verifyElementPresent(findTestObject('Object Repository/Page_Dashboard/h6_Dashboard'), 10)

// Take screenshot of the dashboard
WebUI.takeScreenshot('Screenshots/valid_login_dashboard.png')

// Log out
WebUI.click(findTestObject('Object Repository/Page_Dashboard/span_User_Dropdown'))
WebUI.click(findTestObject('Object Repository/Page_Dashboard/a_Logout'))

// Verify return to login page
WebUI.waitForElementPresent(findTestObject('Object Repository/Page_Login/input_Username'), 30)

// Close browser
WebUI.closeBrowser()