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

// Open browser and navigate to the login page
WebUI.openBrowser('')
WebUI.navigateToUrl('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login')

// Wait for page to load
WebUI.waitForElementVisible(findTestObject('Login_Page/txt_Username'), 10)

// Input invalid username and password
WebUI.setText(findTestObject('Login_Page/txt_Username'), username)
WebUI.setText(findTestObject('Login_Page/txt_Password'), password)

// Click login button
WebUI.click(findTestObject('Login_Page/btn_Login'))

// Verify error message appears
WebUI.waitForElementVisible(findTestObject('Login_Page/txt_ErrorMessage'), 10)
WebUI.verifyElementPresent(findTestObject('Login_Page/txt_ErrorMessage'), 5)
WebUI.verifyElementText(findTestObject('Login_Page/txt_ErrorMessage'), 'Invalid credentials')

// Capture screenshot of error message
WebUI.takeScreenshot('invalid_login_error.png')

// Close browser
WebUI.closeBrowser()