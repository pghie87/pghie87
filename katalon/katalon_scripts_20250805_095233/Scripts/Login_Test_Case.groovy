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

// Open browser and navigate to Orange HRM login page
WebUI.openBrowser('')
WebUI.navigateToUrl('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login')

// Wait for page to load
WebUI.waitForElementVisible(findTestObject('Object Repository/Page_OrangeHRM/input_Username'), 10)

// Take screenshot of login page
WebUI.takeScreenshot('login_page.png')

// Enter credentials
WebUI.setText(findTestObject('Object Repository/Page_OrangeHRM/input_Username'), username)
WebUI.setText(findTestObject('Object Repository/Page_OrangeHRM/input_Password'), password)

// Click login button
WebUI.click(findTestObject('Object Repository/Page_OrangeHRM/button_Login'))

// Verify login was successful by checking if Dashboard page is displayed
WebUI.waitForElementVisible(findTestObject('Object Repository/Page_OrangeHRM/h6_Dashboard'), 10)
WebUI.verifyElementPresent(findTestObject('Object Repository/Page_OrangeHRM/h6_Dashboard'), 5)
WebUI.verifyElementText(findTestObject('Object Repository/Page_OrangeHRM/h6_Dashboard'), 'Dashboard')

// Take screenshot after successful login
WebUI.takeScreenshot('dashboard_page.png')

// Log test result
WebUI.comment('Login successful with username: ' + username)